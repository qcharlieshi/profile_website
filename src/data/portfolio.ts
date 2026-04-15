import type { PortfolioProject } from '../types/index';

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'genzed',
    title: 'GENZED | Online Multiplayer Arena Shooter',
    description: 'GENZED was developed utilizing the Phaser Javascript game engine and socket technology to achieve real time multiplayer gameplay. We utilized various techniques to handle our client server architecture for smooth latency compensation. Pathfinding and lighting were default achieved by using a modified A* algorithm and our own raycasting formula.',
    tags: ['Javascript', 'React', 'Phaser', 'Socket.io'],
    date: 'April 2017',
    featured: true,
  },
  {
    slug: 'project-2',
    title: 'Project Title 2',
    description: 'Description for project 2',
    tags: ['TypeScript', 'Node.js'],
    date: 'March 2017',
  },
  {
    slug: 'project-3',
    title: 'Project Title 3',
    description: 'Description for project 3',
    tags: ['React', 'Redux'],
    date: 'February 2017',
  },
  {
    slug: 'project-4',
    title: 'Project Title 4',
    description: 'Description for project 4',
    tags: ['Express', 'PostgreSQL'],
    date: 'January 2017',
  },
  {
    slug: 'project-5',
    title: 'Project Title 5',
    description: 'Description for project 5',
    tags: ['Next.js', 'Tailwind'],
    date: 'December 2016',
  },
  {
    slug: 'project-6',
    title: 'Project Title 6',
    description: 'Description for project 6',
    tags: ['Python', 'Django'],
    date: 'November 2016',
  },
  {
    slug: 'project-7',
    title: 'Project Title 7',
    description: 'Description for project 7',
    tags: ['Vue.js', 'Vuex'],
    date: 'October 2016',
  },
];
