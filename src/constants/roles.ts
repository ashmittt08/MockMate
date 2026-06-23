export const ROLES = [
  {
    id: 'Frontend',
    title: 'Frontend Engineer',
    desc: 'UI architectures, reconciliation, CSS layouts, and component optimizations.',
    color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5'
  },
  {
    id: 'Backend',
    title: 'Backend Engineer',
    desc: 'System design, rate limiting, sharding, and database indexing.',
    color: 'text-purple-400 border-purple-500/25 bg-purple-500/5'
  },
  {
    id: 'Product Manager',
    title: 'Product Manager',
    desc: 'Product strategy, metrics, roadmap priorities, and conflict resolution.',
    color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5'
  },
  {
    id: 'Data Scientist',
    title: 'Data Scientist',
    desc: 'Machine learning metrics, bias-variance trade-offs, and attention mechanisms.',
    color: 'text-orange-400 border-orange-500/25 bg-orange-500/5'
  }
] as const;

export type RoleId = typeof ROLES[number]['id'];
