"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var path = __importStar(require("path"));
var zod_1 = require("zod");
var play_sound_1 = __importDefault(require("play-sound"));
// Initialize audio player
var audioPlayer = (0, play_sound_1.default)({});
// Create server instance
var server = new index_js_1.Server({
    name: "audio-player",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        resources: {}
    },
});
// Track current playback process
var currentPlayback = null;
// Define allowed audio extensions
var ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg'];
// Zod schema for validating file paths
var AudioFileSchema = zod_1.z.object({
    filepath: zod_1.z.string().refine(function (path) { return ALLOWED_EXTENSIONS.some(function (ext) { return path.toLowerCase().endsWith(ext); }); }, "File must be a supported audio format (MP3, WAV, M4A, OGG)")
});
// List available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
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
            }];
    });
}); });
// Handle tool execution
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, args, filepath;
    return __generator(this, function (_b) {
        _a = request.params, name = _a.name, args = _a.arguments;
        try {
            if (name === "play-audio") {
                // Stop any current playback
                if (currentPlayback) {
                    currentPlayback.kill();
                    currentPlayback = null;
                }
                filepath = AudioFileSchema.parse(args).filepath;
                // Start playback
                try {
                    currentPlayback = audioPlayer.play(filepath, function (err) {
                        if (err) {
                            console.error("Error playing file: ".concat(err));
                            currentPlayback = null;
                        }
                    });
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Started playing: ".concat(path.basename(filepath)),
                                },
                            ],
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Failed to play audio: ".concat(error instanceof Error ? error.message : 'Unknown error'),
                                },
                            ],
                            isError: true
                        }];
                }
            }
            else if (name === "stop-audio") {
                if (currentPlayback) {
                    currentPlayback.kill();
                    currentPlayback = null;
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Stopped audio playback",
                                },
                            ],
                        }];
                }
                else {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "No audio is currently playing",
                                },
                            ],
                        }];
                }
            }
            else {
                throw new Error("Unknown tool: ".concat(name));
            }
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error("Invalid arguments: ".concat(error.errors
                    .map(function (e) { return "".concat(e.path.join("."), ": ").concat(e.message); })
                    .join(", ")));
            }
            throw error;
        }
        return [2 /*return*/];
    });
}); });
// List resources (audio files in allowed directories)
server.setRequestHandler(types_js_1.ListResourcesRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Note: In a real implementation, you would scan allowed directories
        // for audio files and return them as resources
        return [2 /*return*/, {
                resources: []
            }];
    });
}); });
// Read resource contents
server.setRequestHandler(types_js_1.ReadResourceRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Note: In a real implementation, you would validate and return
        // metadata about the requested audio file
        throw new Error("Resource not found");
    });
}); });
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Audio Player MCP Server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map