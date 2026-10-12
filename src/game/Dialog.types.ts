export type GameDialogProps = { title: string; text: string; celebrate?: boolean; actions: { label: string; onPress: () => void; secondary?: boolean }[]; onCancel?: () => void };
