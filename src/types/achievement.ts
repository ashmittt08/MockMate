export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}
