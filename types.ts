import React from 'react';

export interface HackathonStat {
  label: string;
  value: string;
  subLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Leader' | 'Member' | 'Mentor';
  avatar: string;
  status: 'Online' | 'Offline' | 'Busy';
}

export interface ParticipantTeam {
  id: string;
  name: string;
  hackathonId: string;
  hackathonName: string;
  hackathonOrganizer?: string; // Added organizer name
  role: 'Leader' | 'Member';
  status: 'Verified' | 'Pending' | 'Looking for Members';
  members: TeamMember[];
  submissionStatus: 'Not Started' | 'Draft' | 'Submitted' | 'Evaluated';
  nextTask?: string;
}

export interface HackathonEvent {
  id: string;
  name: string;
  organizer: {
    name: string;
    logo: string; // URL or short code for avatar
  };
  status: 'Live' | 'Upcoming' | 'Past' | 'Registration Open';
  startDate: string;
  endDate: string;
  location: string;
  theme: string[];
  userStatus: 'Registered' | 'Team Formed' | 'Submitted' | 'Not Registered';
  
  // KPI & Risk Intelligence
  riskLevel: 'Low' | 'Medium' | 'High';
  readinessScore: number; // 0-100
  nextDeadlineLabel: string;
  nextDeadlineTime: string;
  actionsRequiredCount: number;
  bannerGradient: string; 
}

export interface Notification {
  id: string;
  type: 'Invite' | 'Deadline' | 'Announcement' | 'System';
  title: string;
  message: string;
  time: string;
  priority?: 'High' | 'Normal';
  action?: {
    label: string;
    link: string;
  };
}

export enum HackathonTheme {
  HPC = 'High-Performance Computing',
  AI_ML = 'AI / ML',
  DEV_TOOLS = 'Developer Tools',
  CLOUD = 'Cloud & Distributed Systems',
  CYBERSECURITY = 'Cybersecurity',
  SUSTAINABILITY = 'Sustainability',
  OPEN = 'Open Innovation'
}