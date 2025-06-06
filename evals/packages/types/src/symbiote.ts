import { z } from "zod"

import { Equals, Keys, AssertEqual } from "./utils.js"

/**
 * ProviderName
 */

export const providerNames = [
	"anthropic",
	"glama",
	"openrouter",
	"bedrock",
	"vertex",
	"openai",
	"ollama",
	"vscode-lm",
	"lmstudio",
	"gemini",
	"openai-native",
	"xai",
	"mistral",
	"deepseek",
	"unbound",
	"requesty",
	"human-relay",
	"fake-ai",
] as const

export const providerNamesSchema = z.enum(providerNames)

export type ProviderName = z.infer<typeof providerNamesSchema>

/**
 * ToolGroup
 */

export const toolGroups = ["read", "edit", "browser", "command", "mcp", "modes"] as const

export const toolGroupsSchema = z.enum(toolGroups)

export type ToolGroup = z.infer<typeof toolGroupsSchema>

/**
 * CheckpointStorage
 */

export const checkpointStorages = ["task", "workspace"] as const

export const checkpointStoragesSchema = z.enum(checkpointStorages)

export type CheckpointStorage = z.infer<typeof checkpointStoragesSchema>

export const isCheckpointStorage = (value: string): value is CheckpointStorage =>
	checkpointStorages.includes(value as CheckpointStorage)

/**
 * Language
 */

export const languages = [
	"ca",
	"de",
	"en",
	"es",
	"fr",
	"hi",
	"it",
	"ja",
	"ko",
	"pl",
	"pt-BR",
	"tr",
	"vi",
	"zh-CN",
	"zh-TW",
] as const

export const languagesSchema = z.enum(languages)

export type Language = z.infer<typeof languagesSchema>

export const isLanguage = (value: string): value is Language => languages.includes(value as Language)

/**
 * TelemetrySetting
 */

export const telemetrySettings = ["unset", "enabled", "disabled"] as const

export const telemetrySettingsSchema = z.enum(telemetrySettings)

export type TelemetrySetting = z.infer<typeof telemetrySettingsSchema>

/**
 * ModelInfo
 */

export const modelInfoSchema = z.object({
	maxTokens: z.number().nullish(),
	contextWindow: z.number(),
	supportsImages: z.boolean().optional(),
	supportsComputerUse: z.boolean().optional(),
	supportsPromptCache: z.boolean(),
	inputPrice: z.number().optional(),
	outputPrice: z.number().optional(),
	cacheWritesPrice: z.number().optional(),
	cacheReadsPrice: z.number().optional(),
	description: z.string().optional(),
	reasoningEffort: z.enum(["low", "medium", "high"]).optional(),
	thinking: z.boolean().optional(),
})

export type ModelInfo = z.infer<typeof modelInfoSchema>

/**
 * ApiConfigMeta
 */

export const apiConfigMetaSchema = z.object({
	id: z.string(),
	name: z.string(),
	apiProvider: providerNamesSchema.optional(),
})

export type ApiConfigMeta = z.infer<typeof apiConfigMetaSchema>

/**
 * HistoryItem
 */

export const historyItemSchema = z.object({
	id: z.string(),
	number: z.number(),
	ts: z.number(),
	task: z.string(),
	tokensIn: z.number(),
	tokensOut: z.number(),
	cacheWrites: z.number().optional(),
	cacheReads: z.number().optional(),
	totalCost: z.number(),
	size: z.number().optional(),
})

export type HistoryItem = z.infer<typeof historyItemSchema>

/**
 * GroupOptions
 */

export const groupOptionsSchema = z.object({
	fileRegex: z
		.string()
		.optional()
		.refine(
			(pattern) => {
				if (!pattern) {
					return true // Optional, so empty is valid.
				}

				try {
					new RegExp(pattern)
					return true
				} catch {
					return false
				}
			},
			{ message: "Invalid regular expression pattern" },
		),
	description: z.string().optional(),
})

export type GroupOptions = z.infer<typeof groupOptionsSchema>

/**
 * GroupEntry
 */

export const groupEntrySchema = z.union([toolGroupsSchema, z.tuple([toolGroupsSchema, groupOptionsSchema])])

export type GroupEntry = z.infer<typeof groupEntrySchema>

/**
 * ModeConfig
 */

const groupEntryArraySchema = z.array(groupEntrySchema).refine(
	(groups) => {
		const seen = new Set()

		return groups.every((group) => {
			// For tuples, check the group name (first element).
			const groupName = Array.isArray(group) ? group[0] : group

			if (seen.has(groupName)) {
				return false
			}

			seen.add(groupName)
			return true
		})
	},
	{ message: "Duplicate groups are not allowed" },
)

export const modeConfigSchema = z.object({
	slug: z.string().regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters numbers and dashes"),
	name: z.string().min(1, "Name is required"),
	roleDefinition: z.string().min(1, "Role definition is required"),
	customInstructions: z.string().optional(),
	groups: groupEntryArraySchema,
	source: z.enum(["global", "project"]).optional(),
})

export type ModeConfig = z.infer<typeof modeConfigSchema>

/**
 * CustomModesSettings
 */

export const customModesSettingsSchema = z.object({
	customModes: z.array(modeConfigSchema).refine(
		(modes) => {
			const slugs = new Set()

			return modes.every((mode) => {
				if (slugs.has(mode.slug)) {
					return false
				}

				slugs.add(mode.slug)
				return true
			})
		},
		{
			message: "Duplicate mode slugs are not allowed",
		},
	),
})

export type CustomModesSettings = z.infer<typeof customModesSettingsSchema>

/**
 * PromptComponent
 */

export const promptComponentSchema = z.object({
	roleDefinition: z.string().optional(),
	customInstructions: z.string().optional(),
})

export type PromptComponent = z.infer<typeof promptComponentSchema>

/**
 * CustomModePrompts
 */

export const customModePromptsSchema = z.record(z.string(), promptComponentSchema.optional())

export type CustomModePrompts = z.infer<typeof customModePromptsSchema>

/**
 * CustomSupportPrompts
 */

export const customSupportPromptsSchema = z.record(z.string(), z.string().optional())

export type CustomSupportPrompts = z.infer<typeof customSupportPromptsSchema>

/**
 * ExperimentId
 */

export const experimentIds = ["search_and_replace", "insert_content", "powerSteering", "append_to_file"] as const

export const experimentIdsSchema = z.enum(experimentIds)

export type ExperimentId = z.infer<typeof experimentIdsSchema>

/**
 * Experiments
 */

const experimentsSchema = z.object({
	search_and_replace: z.boolean(),
	insert_content: z.boolean(),
	powerSteering: z.boolean(),
	append_to_file: z.boolean(),
})

export type Experiments = z.infer<typeof experimentsSchema>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _AssertExperiments = AssertEqual<Equals<ExperimentId, Keys<Experiments>>>

/**
 * ProviderSettings
 */

export const providerSettingsSchema = z.object({
	apiProvider: providerNamesSchema.optional(),
	// Anthropic
	apiModelId: z.string().optional(),
	apiKey: z.string().optional(),
	anthropicBaseUrl: z.string().optional(),
	anthropicUseAuthToken: z.boolean().optional(),
	// Glama
	glamaModelId: z.string().optional(),
	glamaModelInfo: modelInfoSchema.optional(),
	glamaApiKey: z.string().optional(),
	// OpenRouter
	openRouterApiKey: z.string().optional(),
	openRouterModelId: z.string().optional(),
	openRouterModelInfo: modelInfoSchema.optional(),
	openRouterBaseUrl: z.string().optional(),
	openRouterSpecificProvider: z.string().optional(),
	openRouterUseMiddleOutTransform: z.boolean().optional(),
	// Amazon Bedrock
	awsAccessKey: z.string().optional(),
	awsSecretKey: z.string().optional(),
	awsSessionToken: z.string().optional(),
	awsRegion: z.string().optional(),
	awsUseCrossRegionInference: z.boolean().optional(),
	awsUsePromptCache: z.boolean().optional(),
	awspromptCacheId: z.string().optional(),
	awsProfile: z.string().optional(),
	awsUseProfile: z.boolean().optional(),
	awsCustomArn: z.string().optional(),
	// Google Vertex
	vertexKeyFile: z.string().optional(),
	vertexJsonCredentials: z.string().optional(),
	vertexProjectId: z.string().optional(),
	vertexRegion: z.string().optional(),
	// OpenAI
	openAiBaseUrl: z.string().optional(),
	openAiApiKey: z.string().optional(),
	openAiR1FormatEnabled: z.boolean().optional(),
	openAiModelId: z.string().optional(),
	openAiCustomModelInfo: modelInfoSchema.optional(),
	openAiUseAzure: z.boolean().optional(),
	azureApiVersion: z.string().optional(),
	openAiStreamingEnabled: z.boolean().optional(),
	// Ollama
	ollamaModelId: z.string().optional(),
	ollamaBaseUrl: z.string().optional(),
	// VS Code LM
	vsCodeLmModelSelector: z
		.object({
			vendor: z.string().optional(),
			family: z.string().optional(),
			version: z.string().optional(),
			id: z.string().optional(),
		})
		.optional(),
	// LM Studio
	lmStudioModelId: z.string().optional(),
	lmStudioBaseUrl: z.string().optional(),
	lmStudioDraftModelId: z.string().optional(),
	lmStudioSpeculativeDecodingEnabled: z.boolean().optional(),
	// Gemini
	geminiApiKey: z.string().optional(),
	googleGeminiBaseUrl: z.string().optional(),
	// OpenAI Native
	openAiNativeApiKey: z.string().optional(),
	// XAI
	xaiApiKey: z.string().optional(),
	// Mistral
	mistralApiKey: z.string().optional(),
	mistralCodestralUrl: z.string().optional(),
	// DeepSeek
	deepSeekBaseUrl: z.string().optional(),
	deepSeekApiKey: z.string().optional(),
	// Unbound
	unboundApiKey: z.string().optional(),
	unboundModelId: z.string().optional(),
	unboundModelInfo: modelInfoSchema.optional(),
	// Requesty
	requestyApiKey: z.string().optional(),
	requestyModelId: z.string().optional(),
	requestyModelInfo: modelInfoSchema.optional(),
	// Claude 3.7 Sonnet Thinking
	modelMaxTokens: z.number().optional(), // Currently only used by Anthropic hybrid thinking models.
	modelMaxThinkingTokens: z.number().optional(), // Currently only used by Anthropic hybrid thinking models.
	// Generic
	includeMaxTokens: z.boolean().optional(),
	modelTemperature: z.number().nullish(),
	reasoningEffort: z.enum(["low", "medium", "high"]).optional(),
	rateLimitSeconds: z.number().optional(),
	// Fake AI
	fakeAi: z.unknown().optional(),
})

export type ProviderSettings = z.infer<typeof providerSettingsSchema>

type ProviderSettingsRecord = Record<Keys<ProviderSettings>, undefined>

const providerSettingsRecord: ProviderSettingsRecord = {
	apiProvider: undefined,
	// Anthropic
	apiModelId: undefined,
	apiKey: undefined,
	anthropicBaseUrl: undefined,
	anthropicUseAuthToken: undefined,
	// Glama
	glamaModelId: undefined,
	glamaModelInfo: undefined,
	glamaApiKey: undefined,
	// OpenRouter
	openRouterApiKey: undefined,
	openRouterModelId: undefined,
	openRouterModelInfo: undefined,
	openRouterBaseUrl: undefined,
	openRouterSpecificProvider: undefined,
	openRouterUseMiddleOutTransform: undefined,
	// Amazon Bedrock
	awsAccessKey: undefined,
	awsSecretKey: undefined,
	awsSessionToken: undefined,
	awsRegion: undefined,
	awsUseCrossRegionInference: undefined,
	awsUsePromptCache: undefined,
	awspromptCacheId: undefined,
	awsProfile: undefined,
	awsUseProfile: undefined,
	awsCustomArn: undefined,
	// Google Vertex
	vertexKeyFile: undefined,
	vertexJsonCredentials: undefined,
	vertexProjectId: undefined,
	vertexRegion: undefined,
	// OpenAI
	openAiBaseUrl: undefined,
	openAiApiKey: undefined,
	openAiR1FormatEnabled: undefined,
	openAiModelId: undefined,
	openAiCustomModelInfo: undefined,
	openAiUseAzure: undefined,
	azureApiVersion: undefined,
	openAiStreamingEnabled: undefined,
	// xAI
	xaiApiKey: undefined,
	// Ollama
	ollamaModelId: undefined,
	ollamaBaseUrl: undefined,
	// VS Code LM
	vsCodeLmModelSelector: undefined,
	lmStudioModelId: undefined,
	lmStudioBaseUrl: undefined,
	lmStudioDraftModelId: undefined,
	lmStudioSpeculativeDecodingEnabled: undefined,
	// Gemini
	geminiApiKey: undefined,
	googleGeminiBaseUrl: undefined,
	// OpenAI Native
	openAiNativeApiKey: undefined,
	// Mistral
	mistralApiKey: undefined,
	mistralCodestralUrl: undefined,
	// DeepSeek
	deepSeekBaseUrl: undefined,
	deepSeekApiKey: undefined,
	// Unbound
	unboundApiKey: undefined,
	unboundModelId: undefined,
	unboundModelInfo: undefined,
	// Requesty
	requestyApiKey: undefined,
	requestyModelId: undefined,
	requestyModelInfo: undefined,
	// Claude 3.7 Sonnet Thinking
	modelMaxTokens: undefined,
	modelMaxThinkingTokens: undefined,
	// Generic
	includeMaxTokens: undefined,
	modelTemperature: undefined,
	reasoningEffort: undefined,
	rateLimitSeconds: undefined,
	// Fake AI
	fakeAi: undefined,
}

export const PROVIDER_SETTINGS_KEYS = Object.keys(providerSettingsRecord) as Keys<ProviderSettings>[]

/**
 * GlobalSettings
 */

export const globalSettingsSchema = z.object({
	currentApiConfigName: z.string().optional(),
	listApiConfigMeta: z.array(apiConfigMetaSchema).optional(),
	pinnedApiConfigs: z.record(z.string(), z.boolean()).optional(),

	lastShownAnnouncementId: z.string().optional(),
	customInstructions: z.string().optional(),
	taskHistory: z.array(historyItemSchema).optional(),

	autoApprovalEnabled: z.boolean().optional(),
	alwaysAllowReadOnly: z.boolean().optional(),
	alwaysAllowReadOnlyOutsideWorkspace: z.boolean().optional(),
	alwaysAllowWrite: z.boolean().optional(),
	alwaysAllowWriteOutsideWorkspace: z.boolean().optional(),
	writeDelayMs: z.number().optional(),
	alwaysAllowBrowser: z.boolean().optional(),
	alwaysApproveResubmit: z.boolean().optional(),
	requestDelaySeconds: z.number().optional(),
	alwaysAllowMcp: z.boolean().optional(),
	alwaysAllowModeSwitch: z.boolean().optional(),
	alwaysAllowSubtasks: z.boolean().optional(),
	alwaysAllowExecute: z.boolean().optional(),
	allowedCommands: z.array(z.string()).optional(),

	browserToolEnabled: z.boolean().optional(),
	browserViewportSize: z.string().optional(),
	screenshotQuality: z.number().optional(),
	remoteBrowserEnabled: z.boolean().optional(),
	remoteBrowserUrl: z.string().optional(),
	remoteBrowserApiKey: z.string().optional(),

	telemetry: telemetrySettingsSchema.optional(),
	language: languagesSchema.optional(),
	checkpointStorage: checkpointStoragesSchema.optional(),
	experiments: z.record(z.string(), z.boolean()).optional(),
	customStoragePath: z.string().optional(),
	customModePrompts: customModePromptsSchema.optional(),
	customSupportPrompts: customSupportPromptsSchema.optional(),
})

export type GlobalSettings = z.infer<typeof globalSettingsSchema>

/**
 * RooCodeSettings
 */

export const symbioteSettingsSchema = z.intersection(providerSettingsSchema, globalSettingsSchema)

export type SymbioteSettings = z.infer<typeof symbioteSettingsSchema>

/**
 * ApiConfig
 */

export const apiConfigSchema = z.object({
	id: z.string(),
	name: z.string(),
	settings: symbioteSettingsSchema,
})

export type ApiConfig = z.infer<typeof apiConfigSchema>

/**
 * ApiConfigs
 */

export const apiConfigsSchema = z.object({
	apiConfigs: z.array(apiConfigSchema),
})

export type ApiConfigs = z.infer<typeof apiConfigsSchema>

/**
 * Backward compatibility
 */

export const rooCodeSettingsSchema = symbioteSettingsSchema
export type RooCodeSettings = SymbioteSettings
