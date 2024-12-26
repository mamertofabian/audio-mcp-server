import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import * as path from 'path';
import { z } from "zod";
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

// Create server instance
const server = new Server(
  {
    name: "audio-player",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    },
  }
);

// Track current playback
let currentProcess: any = null;

// Define allowed audio extensions
const ALLOWED_EXTENSIONS = ['.mp3', '.wav'];

// Zod schema for validating file paths
const AudioFileSchema = z.object({
  filepath: z.string().refine(
    (path) => ALLOWED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext)),
    "File must be a supported audio format (MP3, WAV)"
  )
});

// Function to stop current playback
function stopPlayback() {
  if (currentProcess) {
    try {
      // On Windows, we need to kill the process group
      process.platform === 'win32' 
        ? exec('taskkill /F /T /PID ' + currentProcess.pid)
        : currentProcess.kill();
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
    currentProcess = null;
  }
}

// Function to play audio file using platform-specific commands
async function playAudioFile(filepath: string): Promise<void> {
  try {
    stopPlayback();
    // if filepath does not exist, try prefixing with "D:\GitHub\elevenlabs-mcp-server"
    if (!fs.existsSync(filepath)) {
      filepath = path.join("D:\\GitHub\\elevenlabs-mcp-server", filepath);
    }

    let command: string;
    if (process.platform === 'win32') {
      // Use 'start' command with wait flag (/WAIT) to keep process reference
      command = `start /WAIT "" "${filepath}"`;
    } else if (process.platform === 'darwin') {
      command = `afplay "${filepath}"`;
    } else {
      command = `aplay "${filepath}"`;
    }

    currentProcess = exec(command, (error) => {
      if (error) {
        console.error('Error playing audio:', error);
      }
      currentProcess = null;
    });

  } catch (error) {
    throw new Error(`Failed to play audio: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "play-audio",
        description: "Play an audio file",
        inputSchema: {
          type: "object",
          properties: {
            filepath: {
              type: "string",
              description: "Path to the audio file (must be MP3 or WAV)",
            },
          },
          required: ["filepath"],
        },
      },
      {
        name: "stop-audio",
        description: "Stop currently playing audio",
        inputSchema: {
          type: "object",
          properties: {},
        },
      }
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "play-audio") {
      // Validate input
      const { filepath } = AudioFileSchema.parse(args);

      // Start playback
      try {
        await playAudioFile(filepath);
        return {
          content: [
            {
              type: "text",
              text: `Playing: ${path.basename(filepath)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to play audio: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true
        };
      }

    } else if (name === "stop-audio") {
      if (currentProcess) {
        stopPlayback();
        return {
          content: [
            {
              type: "text",
              text: "Stopped audio playback",
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: "No audio is currently playing",
            },
          ],
        };
      }
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid arguments: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
});

// List resources (audio files in allowed directories)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  // Note: In a real implementation, you would scan allowed directories
  // for audio files and return them as resources
  return {
    resources: []
  };
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  // Note: In a real implementation, you would validate and return
  // metadata about the requested audio file
  throw new Error("Resource not found");
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Audio Player MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
