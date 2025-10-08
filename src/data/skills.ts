/**
 * Skills and technologies data
 */

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'other';
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export const skills: Skill[] = [
  // Frontend
  { name: 'React', category: 'frontend', proficiency: 'expert' },
  { name: 'Redux', category: 'frontend', proficiency: 'advanced' },
  { name: 'TypeScript', category: 'frontend', proficiency: 'advanced' },
  { name: 'JavaScript', category: 'frontend', proficiency: 'expert' },
  { name: 'Next.js', category: 'frontend', proficiency: 'advanced' },
  { name: 'Tailwind CSS', category: 'frontend', proficiency: 'advanced' },
  { name: 'HTML/CSS', category: 'frontend', proficiency: 'expert' },

  // Backend
  { name: 'Node.js', category: 'backend', proficiency: 'advanced' },
  { name: 'Express', category: 'backend', proficiency: 'advanced' },
  { name: 'Python', category: 'backend', proficiency: 'intermediate' },
  { name: 'Java', category: 'backend', proficiency: 'intermediate' },

  // Database
  { name: 'PostgreSQL', category: 'database', proficiency: 'advanced' },
  { name: 'MySQL', category: 'database', proficiency: 'intermediate' },
  { name: 'Redis', category: 'database', proficiency: 'intermediate' },
  { name: 'Sequelize', category: 'database', proficiency: 'advanced' },

  // DevOps
  { name: 'Git', category: 'devops', proficiency: 'advanced' },
  { name: 'Docker', category: 'devops', proficiency: 'intermediate' },
  { name: 'Webpack', category: 'devops', proficiency: 'advanced' },
  { name: 'CI/CD', category: 'devops', proficiency: 'intermediate' },

  // Other
  { name: 'Socket.io', category: 'other', proficiency: 'advanced' },
  { name: 'Phaser', category: 'other', proficiency: 'intermediate' }
];

export const skillsByCategory: SkillCategory[] = [
  {
    title: 'Frontend Development',
    skills: skills.filter(s => s.category === 'frontend')
  },
  {
    title: 'Backend Development',
    skills: skills.filter(s => s.category === 'backend')
  },
  {
    title: 'Database & Storage',
    skills: skills.filter(s => s.category === 'database')
  },
  {
    title: 'DevOps & Tools',
    skills: skills.filter(s => s.category === 'devops')
  },
  {
    title: 'Other Technologies',
    skills: skills.filter(s => s.category === 'other')
  }
];
