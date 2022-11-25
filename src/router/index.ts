import { createRouter, createWebHistory } from "vue-router";

export default createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE),
  routes: [{
    path: '/api-test-excel',
    name: 'apiTestExcel',
    component: () => 
      import(/* webpackChunkName: "apiTestExcel" */ '../views/apiTestExcel/ApiTestExcel.vue'),
  }],
})