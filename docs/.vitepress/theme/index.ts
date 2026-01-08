import DefaultTheme from 'vitepress/theme';
import './custom.css';

// Import all Orio UI components globally for use in markdown
import Button from '../../../src/runtime/components/Button.vue';
import Input from '../../../src/runtime/components/Input.vue';
import Textarea from '../../../src/runtime/components/Textarea.vue';
import CheckBox from '../../../src/runtime/components/CheckBox.vue';
import DatePicker from '../../../src/runtime/components/DatePicker.vue';
import DateRangePicker from '../../../src/runtime/components/DateRangePicker.vue';
import Selector from '../../../src/runtime/components/Selector.vue';
import Tag from '../../../src/runtime/components/Tag.vue';
import Icon from '../../../src/runtime/components/Icon.vue';
import LoadingSpinner from '../../../src/runtime/components/LoadingSpinner.vue';
import Modal from '../../../src/runtime/components/Modal.vue';
import Popover from '../../../src/runtime/components/Popover.vue';
import EmptyState from '../../../src/runtime/components/EmptyState.vue';
import DashedContainer from '../../../src/runtime/components/DashedContainer.vue';
import ControlElement from '../../../src/runtime/components/ControlElement.vue';
import ViewText from '../../../src/runtime/components/view/Text.vue';
import ViewDates from '../../../src/runtime/components/view/Dates.vue';
import ViewSeparator from '../../../src/runtime/components/view/Separator.vue';

// Import Layout wrapper
import Layout from './Layout.vue';

// Import CSS
import '../../../src/runtime/assets/css/main.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Register all components globally
    app.component('OrioButton', Button);
    app.component('OrioInput', Input);
    app.component('OrioTextarea', Textarea);
    app.component('OrioCheckBox', CheckBox);
    app.component('OrioDatePicker', DatePicker);
    app.component('OrioDateRangePicker', DateRangePicker);
    app.component('OrioSelector', Selector);
    app.component('OrioTag', Tag);
    app.component('OrioIcon', Icon);
    app.component('OrioLoadingSpinner', LoadingSpinner);
    app.component('OrioModal', Modal);
    app.component('OrioPopover', Popover);
    app.component('OrioEmptyState', EmptyState);
    app.component('OrioDashedContainer', DashedContainer);
    app.component('OrioControlElement', ControlElement);
    app.component('OrioViewText', ViewText);
    app.component('OrioViewDates', ViewDates);
    app.component('OrioViewSeparator', ViewSeparator);
  },
};
