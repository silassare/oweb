import OWebI18n from '../../OWebI18n';
import { forEach } from '../../utils/Utils';
import en from './en';
import fr from './fr';

forEach({ fr, en }, function (value, code) {
	OWebI18n.loadLangData(code, value);
});
