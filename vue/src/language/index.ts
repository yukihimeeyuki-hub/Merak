import {createI18n} from "vue-i18n";
import {ZhCn} from "@/language/modules/module.ts";

const i18n =createI18n({
  legacy: false,
  locale: 'ZhCn',
  messages: {
    ZhCn
  }
})
export default i18n;
