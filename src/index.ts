export { cn } from './lib/utils'
export type { ClassValue } from 'clsx'

export {
  rawTokens,
  semanticTokens,
  type RawTokenName,
  type SemanticTokenName,
  type ThemeTokenName,
  type ThemeTokens,
} from './tokens/tokens'

export {
  FileCard,
  formatBytes,
  type FileCardProps,
  type FileCardStatus,
} from './components/file-card'
export {
  FileQueue,
  type FileQueueItem,
  type FileQueueProps,
} from './components/file-queue'
export { Portal, type PortalProps } from './components/portal'
export {
  UploadDropzone,
  type UploadDropzoneProps,
} from './components/upload-dropzone'
export { ThemeScope, type ThemeScopeProps } from './components/theme-scope'
export {
  CareerMark,
  DesktopMark,
  HealthMark,
  NeuronectionMark,
  NeuronectionWordmark,
  StudyMark,
  useLogoId,
  type LogoProps,
  type LogoTheme,
  type NeuronectionWordmarkProps,
} from './components/logo'
export {
  AboutCard,
  AboutLinkList,
  AboutNote,
  AboutFooterLine,
  AboutPanel,
  FamilyBadge,
  TechChips,
  SponsorCard,
  type AboutCardProps,
  type AboutLinkItem,
  type AboutLinkListProps,
  type AboutNoteProps,
  type AboutFooterLineProps,
  type AboutPanelProps,
  type AboutCreator,
  type AboutLicense,
  type AboutNoteContent,
  type AboutSponsorContent,
  type FamilyApp,
  type FamilyMember,
  type FamilyCreator,
  type FamilyBadgeProps,
  type TechChipsProps,
  type SponsorCardProps,
  type SponsorChannel,
} from './components/about'

export {
  AiActionsDropdown,
  type AiAction,
  type AiActionsDropdownProps,
} from './components/ai-actions-dropdown'
export { AiButton, type AiButtonProps } from './components/ai-button'
export {
  AiMagicFill,
  type AiMagicFillProps,
} from './components/ai-magic-fill'
export {
  FlowStatusCard,
  type FlowError,
  type FlowStatusCardProps,
  type FlowStep,
  type FlowStepStatus,
} from './components/flow-status'
export {
  FlowTraceCard,
  FlowTelemetryStrip,
  formatFlowLatency,
  type FlowTrace,
  type FlowTraceCall,
  type FlowTraceCardLabels,
  type FlowTraceCardProps,
  type FlowTraceStage,
  type FlowTelemetryStripProps,
  type FlowTraceToolOp,
} from './components/flow-trace'
export { Badge, badgeVariants, type BadgeProps } from './components/badge'
export {
  Breadcrumbs,
  type BreadcrumbItem,
  type BreadcrumbLinkProps,
  type BreadcrumbsProps,
} from './components/breadcrumbs'
export { Button, buttonVariants, type ButtonProps } from './components/button'
export {
  ConnectionTestRow,
  type ConnectionTestStatus,
  type ConnectionTestRowProps,
} from './components/connection-test-row'
export {
  WebSearchProvidersPanel,
  type WebSearchProvidersPanelProps,
  type WebSearchProvidersPanelLabels,
  WebSearchProvidersList,
  type WebSearchProvidersListProps,
  type WebSearchProvidersListLabels,
  WebSearchProviderWizard,
  type WebSearchProviderWizardProps,
  type WebSearchProviderWizardLabels,
  WebSearchProviderTiles,
  type WebSearchProviderTilesProps,
  WebSearchProviderSettingsForm,
  type WebSearchProviderSettingsFormProps,
  type WebSearchProviderSettingsFormLabels,
  type WebSearchProviderView,
  type WebSearchProviderCatalog,
  type WebSearchProviderCatalogEntry,
  type WebSearchProviderCatalogField,
  type WebSearchProviderFormValue,
  type WebSearchProviderSaveInput,
  type WebSearchProviderProbeView,
  type WebSearchProbeStatus,
} from './components/web-search-providers'
export {
  parseIntegrationConfigSchema,
  INTEGRATION_VIEW_MODELS_VERSION,
  type IntegrationCapabilityView,
  type IntegrationCatalogEntryView,
  type IntegrationConditionId,
  type IntegrationConfigFieldView,
  type IntegrationConfigSaveInput,
  type IntegrationConfigSchema,
  type IntegrationConfigSchemaField,
  type IntegrationConfigValidationView,
  type IntegrationConfigValues,
  type IntegrationConsentChangeView,
  type IntegrationConsentPayloadView,
  type IntegrationDiscoveredView,
  type IntegrationExtensionGroupView,
  type IntegrationExtensionView,
  type IntegrationInstanceView,
  type IntegrationProvenanceView,
  type IntegrationSourceDraft,
  type IntegrationSourceRowView,
  type IntegrationUpdateView,
  EXTENSION_API_ENVELOPE,
  EXTENSION_CATEGORIES,
  EXTENSION_CAPABILITIES,
  EXTENSION_CAPABILITY_TIERS,
  EXTENSION_CONSENT_DISCLOSURES,
  EXTENSION_ERROR_CODES,
  EXTENSION_IMPORTABLE_CAPABILITIES,
  EXTENSION_KINDS,
  EXTENSION_LIFECYCLE_STATES,
  EXTENSION_ORIGIN_CLASSES,
  EXTENSION_REF_STRATEGIES,
  EXTENSION_RISK_CLASSES,
  EXTENSION_RETRYABLE_VALUES,
  EXTENSION_STATUS_CONDITIONS,
  EXTENSION_STATUS_STATES,
  EXTENSION_SURFACES,
  EXTENSION_TIER_NAMES,
  EXTENSION_TIERS,
} from './contracts'
export {
  IntegrationCapabilityChips,
  OriginChip,
  StatusBadge,
  TierBadge,
  isExtensionCapabilityId,
  isExtensionOriginClass,
  isExtensionStatusState,
  isExtensionTier,
  type IntegrationCapabilityChipsProps,
  type OriginChipProps,
  type StatusBadgeProps,
  type TierBadgeProps,
} from './components/integration-atoms'
export {
  IntegrationCard,
  type IntegrationCardLabels,
  type IntegrationCardProps,
} from './components/integration-card'
export {
  IntegrationCatalogGrid,
  type IntegrationCatalogGridLabels,
  type IntegrationCatalogGridProps,
} from './components/integration-catalog-grid'
export {
  IntegrationInstancesList,
  type IntegrationInstancesListLabels,
  type IntegrationInstancesListProps,
} from './components/integration-instances-list'
export {
  IntegrationSourcesList,
  type IntegrationSourcesListLabels,
  type IntegrationSourcesListProps,
} from './components/integration-sources-list'
export {
  AddIntegrationSourceDialog,
  type AddIntegrationSourceDialogLabels,
  type AddIntegrationSourceDialogProps,
} from './components/add-integration-source-dialog'
export {
  ConsentDialog,
  type ConsentDialogLabels,
  type ConsentDialogProps,
} from './components/consent-dialog'
export {
  IntegrationConfigForm,
  type IntegrationConfigFormLabels,
  type IntegrationConfigFormProps,
} from './components/integration-config-form'
export {
  ActionResultDialog,
  type ActionResultDialogLabels,
  type ActionResultDialogProps,
} from './components/integration-action-result-dialog'
export {
  DocsDialog,
  type DocsDialogLabels,
  type DocsDialogProps,
  type IntegrationDocsNode,
} from './components/integration-docs-dialog'
export {
  SurfaceRenderer,
  SURFACE_NODE_TYPES,
  SURFACE_NODE_ORDER,
  SURFACE_RUN_ACTION_IDS,
  SURFACE_ITEM_ACTION_IDS,
  SURFACE_PAGE_SIZE,
  surfaceActionId,
  surfaceProgressPercent,
  type SurfaceAction,
  type SurfaceActionId,
  type SurfaceFilter,
  type SurfaceFilterOption,
  type SurfaceLabels,
  type SurfaceNode,
  type SurfaceNodeType,
  type SurfaceRendererProps,
  type SurfaceRow,
  type SurfaceView,
} from './components/surface-renderer'
export {
  ProviderForm,
  CUSTOM_PRESET_KEY,
  type ProviderFormProps,
  type ProviderPresetOption,
} from './components/provider-form'
export {
  ProviderSetupTiles,
  ProviderSetupManualTile,
  type ProviderSetupTilesProps,
  type ProviderSetupTileData,
  type ProviderSetupTileChip,
} from './components/provider-setup-tiles'
export {
  ProviderSetupForm,
  SETUP_ERROR_CODES,
  DEFAULT_SETUP_ERROR_COPY,
  type ProviderSetupFormProps,
  type ProviderSetupFormPreset,
  type ProviderSetupFormValue,
  type ProviderSetupFormError,
  type SetupErrorCode,
} from './components/provider-setup-form'
export {
  SetupReview,
  type SetupReviewProps,
  type SetupReviewModel,
  type SetupReviewSlot,
  type SetupReviewOptions,
  type SetupReviewOptionsKey,
} from './components/setup-review'
export {
  SetupFirstRunCard,
  type SetupFirstRunCardProps,
} from './components/setup-first-run-card'
export {
  SetupSteps,
  type SetupStepsProps,
  type SetupStep,
} from './components/setup-steps'
export {
  SetupAssignments,
  type SetupAssignmentsProps,
  type SetupAssignmentRow,
} from './components/setup-assignments'
export { SwitchRow, type SwitchRowProps } from './components/switch-row'
export { ProviderLogo, type ProviderLogoProps } from './components/provider-logo'
export {
  ProviderCard,
  type ProviderCardProps,
  type ProviderCardAction,
  type ProviderCardBadge,
} from './components/provider-card'
export {
  SettingsShell,
  type SettingsNavItem,
  type SettingsShellProps,
} from './components/settings-shell'
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/card'
export {
  CheckIndicator,
  type CheckIndicatorProps,
} from './components/check-indicator'
export { ChipInput, type ChipInputProps } from './components/chip-input'
export {
  ChipList,
  type ChipListProps,
  type ChipVariant,
} from './components/chip-list'
export {
  Combobox,
  ComboboxMulti,
  type ComboboxProps,
  type ComboboxMultiProps,
  type ComboboxOption,
} from './components/combobox'
export {
  ConfirmationModal,
  type ConfirmationModalProps,
} from './components/confirmation-modal'
export { CopyButton, type CopyButtonProps } from './components/copy-button'
export { ContextMenu, type ContextMenuProps, type ContextMenuItem } from './components/context-menu'
export {
  DatePicker,
  type DatePickerProps,
} from './components/date-picker'
export { EmptyState, type EmptyStateProps } from './components/empty-state'
export { ErrorBanner, type ErrorBannerProps } from './components/error-banner'
export {
  ExpandableSearch,
  type ExpandableSearchProps,
} from './components/expandable-search'
export { FieldLabel, type FieldLabelProps } from './components/field-label'
export { FormModal, type FormModalProps } from './components/form-modal'
export { InfoButton, type InfoButtonProps } from './components/info-button'
export { Input, type InputProps } from './components/input'
export {
  LoginForm,
  type LoginFormFields,
  type LoginFormIcons,
  type LoginFormLabels,
  type LoginFormProps,
  type LoginFormFieldOverrides,
} from './components/login-form'
export {
  RegisterForm,
  type RegisterFormFields,
  type RegisterFormIcons,
  type RegisterFormLabels,
  type RegisterFormProps,
  type RegisterFormFieldOverrides,
} from './components/register-form'
export {
  MarqueeBand,
  MarqueeSurface,
  useMarquee,
  hitTestIds,
  marqueeRect,
  rectsIntersect,
  type MarqueePhase,
  type MarqueeSelection,
  type MarqueeSurfaceProps,
  type Rect,
  type UseMarqueeOptions,
} from './components/marquee'
export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuCheckboxItem,
  MenuSeparator,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  MenuLabel,
  ActionMenu,
  type MenuItemProps,
  type MenuCheckboxItemProps,
  type ActionMenuItem,
  type ActionMenuProps,
} from './components/menu'
export {
  UserMenu,
  type UserMenuItem,
  type UserMenuIcons,
  type UserMenuLanguage,
  type UserMenuProps,
  type UserMenuStatus,
  type UserMenuStatusTone,
  type UserMenuTheme,
  type UserMenuUser,
} from './components/user-menu'
export {
  Modal,
  PanelModal,
  type PanelModalProps,
  ModalClose,
  ModalContent,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  modalContentVariants,
  type ModalContentProps,
} from './components/modal'
export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './components/popover'
export { PopoverButton, type PopoverButtonProps } from './components/popover-button'
export {
  ProfileSwitcher,
  type ProfileItem,
  type ProfileSwitcherIcons,
  type ProfileSwitcherLabels,
  type ProfileSwitcherProps,
} from './components/profile-switcher'
export { RangeBar, type RangeBarProps } from './components/range-bar'
export {
  ScaleSlider,
  scaleColorForValue,
  type ScaleSliderProps,
} from './components/scale-slider'
export { SearchInput, type SearchInputProps } from './components/search-input'
export {
  ModelPicker,
  type ModelPickerModel,
  type ModelPickerProps,
  type ModelPickerProvider,
} from './components/model-picker'
export {
  CapabilityChips,
  type CapabilityChipsProps,
  type CapabilityDescriptor,
} from './components/capability-chips'
export {
  ModelRegistry,
  type ModelRegistryDraft,
  type ModelRegistryModel,
  type ModelRegistryPatch,
  type ModelRegistryProps,
  type ModelRegistryProvider,
  type ModelRegistryRemoteModel,
  type ModelRegistryRemoteState,
} from './components/model-registry'
export { SelectionBar, type SelectionBarProps } from './components/selection-bar'
export {
  SegmentedTabs,
  type SegmentedTabsProps,
  type SegmentedTabsItem,
} from './components/segmented-tabs'
export {
  SidebarNav,
  type NavChild,
  type NavItem,
  type SidebarNavLabels,
  type SidebarNavProps,
} from './components/sidebar-nav'
export {
  Skeleton,
  SkeletonText,
  type SkeletonProps,
  type SkeletonTextProps,
} from './components/skeleton'
export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardPortal,
  type HoverCardProps,
} from './components/hover-card'
export { Spinner, type SpinnerProps } from './components/spinner'
export {
  TaskAssignmentPicker,
  type TaskAssignmentPickerProps,
  type TaskAssignmentSection,
  type TaskAssignmentTask,
} from './components/task-assignment-picker'
export { Table, type TableProps } from './components/table'
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  InfoTooltip,
  type InfoTooltipProps,
} from './components/tooltip'
export { TimeList, type TimeListProps } from './components/time-list'
export {
  TimePicker,
  TimePickerContent,
  type TimePickerProps,
  type TimePickerContentProps,
} from './components/time-picker'
export { UndoNotice, type UndoNoticeProps } from './components/undo-notice'
export { ViewToggle, type ViewToggleProps, type ViewToggleView } from './components/view-toggle'
export {
  Stepper,
  Wizard,
  type StepperProps,
  type StepperStep,
  type WizardProps,
  type WizardStep,
  type WizardContext,
} from './components/wizard'
export {
  RichTextEditor,
  type RichTextEditorProps,
  type RichTextEditorLabels,
  type RichTextEditorIcons,
  type RichTextToolbarGroup,
} from './components/rich-text-editor'
export {
  DictationButton,
  type DictationButtonProps,
  DictationStrip,
  type DictationStripProps,
  type DictationStripLabels,
  useDictation,
  type UseDictationOptions,
  type DictationStatus,
  type DictationError,
  type DictationResult,
} from './components/dictation'
export {
  useAiTextTransform,
  type UseAiTextTransformOptions,
  type AiTextTransformTransport,
  type AiTextTransformStatus,
  type AiTextTransformEventHandlers,
} from './components/ai-text-transform'
export {
  TextDiffView,
  type TextDiffViewProps,
  type TextDiffViewLabels,
  computeLineDiff,
  computeUnitDiff,
  wordSegments,
  type DiffCell,
  type DiffSegment,
  type DiffRow,
  type LineDiffOptions,
  type LineDiffResult,
  type UnitDiffOptions,
} from './components/text-diff-view'
export {
  MarkdownDiffView,
  type MarkdownDiffViewProps,
  type MarkdownDiffViewLabels,
  splitMarkdownBlocks,
} from './components/markdown-diff-view'
export {
  useChatStream,
  liveTurnReducer,
  initialLiveTurnState,
  buildBranchTree,
  linearTree,
  walkActivePath,
  activePathSet,
  variantInfo,
  type ChatRole,
  type ChatMessageStatus,
  type ChatError,
  type ChatMessageVariants,
  type ChatAttachmentView,
  type ChatMessageView,
  type FlowStepInfo,
  type ChatStreamEvent,
  type LiveTurnAction,
  type LiveTurnState,
  type LiveTurnStatus,
  type LiveNodeState,
  type LiveToolCall,
  type BranchNode,
  type BranchNodeInput,
  type BranchTree,
  type ChatStreamTransport,
  type UseChatStreamOptions,
  type UseChatStreamResult,
} from './components/chat-core'
export {
  MarkdownSurface,
  MarkdownCodeBlock,
  MermaidDiagram,
  type MarkdownSurfaceProps,
  type MarkdownComponents,
  type MarkdownCodeBlockProps,
  type MarkdownCodeBlockLabels,
  type MermaidDiagramProps,
} from './components/chat-markdown'
export {
  ChatMessage,
  MessageVariantSwitcher,
  ChatMessageEditor,
  type ChatMessageProps,
  type ChatMessageActions,
  type ChatMessageAction,
  type ChatMessageLabels,
  type MessageVariantSwitcherProps,
  type MessageVariantSwitcherLabels,
  type ChatMessageEditorProps,
  type ChatMessageEditorLabels,
} from './components/chat-message'
export {
  ChatReasoning,
  type ChatReasoningProps,
  type ChatReasoningLabels,
} from './components/chat-reasoning'
export {
  ChatToolCard,
  type ChatToolCardProps,
  type ChatToolCardLabels,
} from './components/chat-tool-card'
export {
  ChatTurnStatus,
  type ChatTurnStatusProps,
  type ChatTurnStatusLabels,
} from './components/chat-turn-status'
export {
  ChatSearchField,
  type ChatSearchFieldProps,
  type ChatSearchFieldLabels,
} from './components/chat-transcript'
export {
  ChatPending,
  type ChatPendingProps,
} from './components/chat-pending'
export {
  ChatWelcome,
  type ChatWelcomeProps,
} from './components/chat-welcome'
export {
  ChatSuggestionCard,
  type ChatSuggestionCardProps,
} from './components/chat-suggestion-card'
export {
  HitlProposalCard,
  type HitlProposalCardProps,
  type HitlProposalCardLabels,
  type HitlProposalStatus,
  type HitlProposalAction,
  FieldDiff,
  type FieldDiffProps,
  type FieldDiffValue,
  type FieldDiffLabels,
  FieldSummary,
  type FieldSummaryProps,
} from './components/chat-hitl'
export {
  ChatComposer,
  type ChatComposerProps,
  type ChatComposerLabels,
  type ChatComposerIcons,
} from './components/chat-composer'
export {
  ChatTranscript,
  type ChatTranscriptProps,
  type ChatTranscriptLabels,
} from './components/chat-transcript'
export {
  ChatBranchTree,
  type ChatBranchTreeProps,
  type ChatBranchTreeLabels,
  type ChatBranchTreeIcons,
  type ChatBranchTreeNode,
} from './components/chat-branch-tree'
export {
  ChatSessionList,
  type ChatSessionListProps,
  type ChatSessionListLabels,
  type ChatSessionListIcons,
  type ChatSessionView,
} from './components/chat-session-list'
export {
  ChatToolsCatalog,
  type ChatToolsCatalogProps,
  type ChatToolsCatalogLabels,
  type ChatToolCatalogEntry,
  type ChatToolCatalogArgument,
} from './components/chat-tools-catalog'
export {
  buildChatMarkdown,
  chatExportFileName,
  downloadChatMarkdown,
  type ChatExportMessage,
  type ChatExportOptions,
} from './components/chat-export'
export {
  ChatHistoryButton,
  type ChatHistoryButtonProps,
  type ChatHistoryButtonLabels,
} from './components/chat-history-button'
export {
  AdminUserTable,
  describeAdminUserError,
  type AdminUser,
  type AdminUserPatch,
  type AdminUserTableIcons,
  type AdminUserTableLabels,
  type AdminUserTableProps,
} from './components/admin-user-table'
export {
  InstanceModeControl,
  describeInstanceModeError,
  type InstanceAuthMode,
  type InstanceModeControlIcons,
  type InstanceModeControlLabels,
  type InstanceModeControlProps,
} from './components/instance-mode-control'
export {
  AuthGate,
  type AuthGateLabels,
  type AuthGateProps,
  type AuthGateStatus,
} from './components/auth-gate'
export {
  ChatTraceMeta,
  type ChatTraceMetaProps,
} from './components/chat-trace-meta'
export {
  ChatTraceTimeline,
  type ChatTraceTimelineProps,
  type ChatTraceTimelineLabels,
  type ChatTraceTimelineTrace,
  type ChatTraceTimelineEntry,
} from './components/chat-trace-timeline'
export {
  ChatPanel,
  type ChatPanelProps,
  type ChatPanelVariant,
} from './components/chat-panel'
export {
  ChatDrawer,
  type ChatDrawerProps,
} from './components/chat-drawer'
export {
  ChatLauncher,
  type ChatLauncherProps,
} from './components/chat-launcher'
