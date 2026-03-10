import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TaskListView from '../views/TaskListView.vue';
import WeekView from '../views/WeekView.vue';
import MonthView from '../views/MonthView.vue';
import YearView from '../views/YearView.vue';
import QuadrantView from '../views/QuadrantView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/app',
    name: 'TaskList',
    component: TaskListView
  },
  {
    path: '/week',
    name: 'Week',
    component: WeekView
  },
  {
    path: '/month',
    name: 'Month',
    component: MonthView
  },
  {
    path: '/year',
    name: 'Year',
    component: YearView
  },
  {
    path: '/quadrant',
    name: 'Quadrant',
    component: QuadrantView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
