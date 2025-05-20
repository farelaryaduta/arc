export const APP_NAME = 'Rillchat Admin Dashboard';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token'
  },
  USERS: {
    BASE: '/api/users',
    STATS: '/api/users/stats',
    SEARCH: '/api/users/search'
  },
  MESSAGES: {
    BASE: '/api/messages',
    STATS: '/api/messages/stats',
    SEARCH: '/api/messages/search'
  },
  REPORTS: {
    BASE: '/api/reports',
    STATS: '/api/reports/stats'
  }
};

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR'
};

export const DASHBOARD_MENU_ITEMS = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard'
  },
  {
    title: 'Users',
    path: '/users',
    icon: 'users'
  },
  {
    title: 'Messages',
    path: '/messages',
    icon: 'message'
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: 'flag'
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: 'settings'
  }
];

export const TABLE_COLUMNS = {
  USERS: [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'createdAt', headerName: 'Created At', width: 180 }
  ],
  MESSAGES: [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'sender', headerName: 'Sender', width: 130 },
    { field: 'receiver', headerName: 'Receiver', width: 130 },
    { field: 'content', headerName: 'Content', width: 300 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'createdAt', headerName: 'Created At', width: 180 }
  ]
};

export const STATUS_COLORS = {
  ACTIVE: '#4CAF50',
  INACTIVE: '#9E9E9E',
  SUSPENDED: '#F44336',
  PENDING: '#FFC107'
};

export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Invalid credentials. Please try again.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.'
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  UPDATE_SUCCESS: 'Successfully updated!',
  DELETE_SUCCESS: 'Successfully deleted!'
}; 