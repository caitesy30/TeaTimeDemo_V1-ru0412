// wwwroot/js/app.js

import Vue from 'vue';
import SurveyEditor from './components/SurveyEditor.vue';

new Vue({
    render: h => h(SurveyEditor)
}).$mount('#app');
