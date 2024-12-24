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
import player from 'play-sound';

// Initialize audio player
const audioPlayer = player({});

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

// Track current playback process
let currentPlayback: any = null;

// Define allowed audio extensions
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg'];

// Zod schema for validating file paths
const AudioFileSchema = z.object({
  filepath: z.string().refine(
    (path) => ALLOWED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext)),
    "File must be a supported audio format (MP3, WAV, M4A, OGG)"
  )
});

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
              description: "Path to the audio file (must be MP3, WAV, M4A, or OGG)",
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
      // Stop any current playback
      if (currentPlayback) {
        currentPlayback.kill();
        currentPlayback = null;
      }

      // Validate input
      const { filepath } = AudioFileSchema.parse(args);

      // Start playback
      try {
        currentPlayback = audioPlayer.play(filepath, (err) => {
          if (err) {
            console.error(`Error playing file: ${err}`);
            currentPlayback = null;
          }
        });

        return {
          content: [
            {
              type: "text",
              text: `Started playing: ${path.basename(filepath)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true
        };
      }
    } else if (name === "stop-audio") {
      if (currentPlayback) {
        currentPlayback.kill();
        currentPlayback = null;
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