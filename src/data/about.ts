/**
 * About/Bio information data
 */

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
  technologies?: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  email?: string;
  location?: string;
  avatar?: string;
}

export const personalInfo: PersonalInfo = {
  name: 'Charlie Shi',
  title: 'Full Stack Developer',
  bio: 'Passionate full stack developer with experience building modern web applications using React, Node.js, and TypeScript. I love creating elegant solutions to complex problems.',
  email: 'contact@example.com',
  location: 'San Francisco, CA'
};

export const socialLinks: SocialLink[] = [
  {
    platform: 'GitHub',
    url: 'https://github.com/yourusername'
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/yourusername'
  },
  {
    platform: 'Twitter',
    url: 'https://twitter.com/yourusername'
  }
];

export const experiences: Experience[] = [
  {
    id: 'exp-1',
    title: 'Full Stack Developer',
    company: 'Company Name',
    location: 'San Francisco, CA',
    startDate: '2020-01',
    current: true,
    description: 'Developed and maintained full-stack web applications using React, Node.js, and PostgreSQL. Collaborated with cross-functional teams to deliver high-quality software solutions.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript']
  },
  {
    id: 'exp-2',
    title: 'Software Engineer',
    company: 'Previous Company',
    location: 'San Francisco, CA',
    startDate: '2018-06',
    endDate: '2019-12',
    description: 'Built responsive web applications and RESTful APIs. Implemented automated testing and CI/CD pipelines.',
    technologies: ['JavaScript', 'Express', 'MongoDB', 'Redux']
  }
];

export const education: Education[] = [
  {
    id: 'edu-1',
    degree: 'Bachelor of Science in Computer Science',
    school: 'University Name',
    location: 'City, State',
    startDate: '2014-09',
    endDate: '2018-05',
    description: 'Focused on software engineering, algorithms, and data structures.'
  }
];
