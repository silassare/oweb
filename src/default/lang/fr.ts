import { OI18nDefinition } from '../../OWebI18n';

export default {
	// ---------START NEW
	OW_ERROR_REQUEST_FAILED: 'Erreur: La requête a échoué.',
	OW_ERROR_REQUEST_TIMED_OUT:
		'Erreur: La requête prends trop de temps à se terminer.',
	OW_ERROR_REQUEST_ABORTED: 'Erreur: La requête a été annulée.',

	OZ_ERROR_NETWORK: 'Erreur: problèmes de connexion internet.',
	OZ_ERROR_SERVER: 'Erreur: echec de récupération des informations.',
	OZ_ERROR_YOU_ARE_NOT_ADMIN: 'Erreur: Vous n\'etes pas un administrateur.',
	OZ_ERROR_NOT_FOUND: 'Erreur: La ressource recherchée n\'est pas retrouvée.',
	OZ_ERROR_SHOULD_ACCEPT_CGU:
		'Vous devez accepter les Conditions Générales d\'Utilisation.',
	// ---------END NEW

	OZ_IMAGE_NOT_VALID:
		'Fichier image invalide. Veuillez choisir une image de type png, jpeg, ou gif.',
	OZ_PROFILE_PIC_SET_TO_DEFAULT: 'Photo de profil par défaut choisie.',
	OZ_PROFILE_PIC_CHANGED: 'Photo de profil changer.',
	OZ_FORM_CONTAINS_EMPTY_FIELD: 'Le champ `{label}` est vide.',
	OZ_FILE_TOO_BIG: 'Fichier trop lourd, maximum 100Mb.',
	OZ_FILE_IS_EMPTY: 'Fichier vide.',
	OZ_ERROR_INVALID_FORM:
		'La requête est invalide. Vous n\'etes peut-être pas autorisé à effectuer cette action.',

	OZ_FIELD_PHONE_ALREADY_REGISTERED:
		'Le {phone} est déjà associé à un autre compte.',
	OZ_FIELD_EMAIL_ALREADY_REGISTERED:
		'{email} est déjà associé à un autre compte.',
	OZ_FIELD_PHONE_INVALID: 'Le numéro est invalide.',
	OZ_FIELD_PHONE_NOT_REGISTERED: 'Ce numéro n\'est pas inscrit.',
	OZ_FIELD_EMAIL_NOT_REGISTERED: 'Cette adresse mail n\'est pas enrégistrée.',
	OZ_FIELD_PASS_INVALID: 'Le mot de passe est incorrect.',
	OZ_FIELD_COUNTRY_NOT_ALLOWED:
		'Le pays spécifié n\'est pas valide. Le service n\'est peut-être pas encore dans votre pays.',
	OZ_AUTH_CODE_SENT: 'Un code vous a été envoyé au: {phone}',
	OZ_AUTH_CODE_NEW_SENT: 'Un nouveau code vous a été envoyé au: {phone}',
	OZ_AUTH_CODE_OK: 'Code de verification correct!',
	OZ_AUTH_CODE_INVALID: 'Le code n\'est pas valide.',
	OZ_AUTH_CODE_EXCEED_MAX_FAIL:
		'Vous avez atteint le nombre maximum d\'échecs autorisés pour le même code.',
	OZ_AUTH_CODE_EXPIRED: 'Le code a déjà expiré.',
	OZ_AUTH_PROCESS_INVALID:
		'Veuillez recommencer le processus d\'authentification',

	OZ_PHONE_AUTH_NOT_STARTED: 'Recommencez la validation du numéro.',
	OZ_PHONE_AUTH_NOT_VALIDATED: 'Vous n\'avez pas validé votre numéro.',
	OZ_PASSWORD_SAME_OLD_AND_NEW_PASS:
		'Votre ancien et nouveau mot de passe sont les mêmes.',
	OZ_PASSWORD_EDIT_SUCCESS: 'Votre mot de passe a été modifié.',

	OZ_FIELD_USER_NAME_INVALID:
		'Le nom et prénoms contient des caractères non autorisés.',
	OZ_FIELD_USER_NAME_TOO_SHORT: 'Le nom et prénoms est trop court.',
	OZ_FIELD_USER_NAME_TOO_LONG: 'Le nom et prénoms est trop long.',
	OZ_FIELD_USER_NAME_CONTAINS_KEYWORDS:
		'Le nom et prénoms ne doit pas contenir des mots clés...',

	OZ_FIELD_EMAIL_INVALID: 'L\'adresse mail n\'est pas valide.',
	OZ_FIELD_GENDER_INVALID: 'Veuillez indiquer votre sexe.',
	OZ_FIELD_BIRTH_DATE_INVALID:
		'La date de naissance n\'est pas valide ({min} ans minimum et {max} ans maximum).',
	OZ_FIELD_PASS_AND_VPASS_NOT_EQUAL:
		'Les mots de passe ne sont pas identiques.',
	OZ_FIELD_PASS_TOO_LONG:
		'Le mot de passe est trop long. ({max} caractères maximum)',
	OZ_FIELD_PASS_TOO_SHORT:
		'Le mot de passe est trop court. ({min} caractères minimum)',
	OZ_SIGNUP_SUCCESS: 'Inscription Réussie.',

	OZ_ERROR_INTERNAL: 'Erreur iterne...',
	OZ_ERROR_YOU_MUST_LOGIN: 'Vous devez vous connecter d\'abord.',
	OZ_ERROR_NOT_ALLOWED:
		'Une erreur s\'est produite. Vous n\'etes peut-être pas autoriser à effectuer cette action.',
	OZ_USER_ONLINE: 'Vous êtes connecté.',
	OZ_USER_LOGOUT: 'Vous vous êtes déconnecté.',
	OZ_LOGOUT_FAIL: 'La déconnexion a échoué.',
	OZ_FILE_UPLOAD_FAIL: 'Échec de l\'envoie du ou des fichiers',
	OZ_FILE_ALIAS_UNKNOWN: 'Fichier alias inconu.',
	OZ_FILE_ALIAS_PARSE_ERROR: 'Fichier alias, erreur d\'analyse.',
	OZ_FILE_ALIAS_NOT_FOUND:
		'Le fichier alias ou le fichier ciblé est introuvable...',

	OW_TIME_DEFAULT_FORMAT: 'd F Y, hh:ii a',
	OW_TIME_DAY_NAMES_SHORT: 'dim.,lun.,mar.,mer.,jeu.,ven.,sam.',
	OW_TIME_DAY_NAMES_FULL: 'dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi',
	OW_TIME_MONTH_NAMES_SHORT:
		'janv.,f\xe9vr.,mars,avr.,mai,juin,juil.,ao\xfbt,sept.,oct.,nov.,d\xe9c.',
	OW_TIME_MONTH_NAMES_FULL:
		'janvier,f\xe9vrier,mars,avril,mai,juin,juillet,ao\xfbt,septembre,octobre,novembre,d\xe9cembre',

	OW_TIME_JUST_NOW: 'à l\'instant',
	OW_TIME_IN_FEW_SECONDS: 'dans un instant',
	OW_TIME_FEW_SECONDS_AGO: 'à l\'instant',
	OW_TIME_N_SECONDS_AGO: 'il y a {nSeconds}s',
	OW_TIME_IN_N_SECONDS: 'dans {nSeconds}s',
	OW_TIME_LESS_THAN_A_MINUTE_AGO: 'il y a environ une minute',
	OW_TIME_IN_LESS_THAN_A_MINUTE: 'dans moins d\'une minute',
	OW_TIME_ABOUT_A_MINUTE_AGO: '1 minute déjà',
	OW_TIME_IN_ABOUT_A_MINUTE: 'dans 1 minute',
	OW_TIME_N_MINUTES_AGO: 'il y a {nMinutes}min',
	OW_TIME_IN_N_MINUTES: 'dans {nMinutes}min',
	OW_TIME_ABOUT_AN_HOUR_AGO: 'il y a 1h',
	OW_TIME_IN_ABOUT_AN_HOUR: 'dans 1h',
	OW_TIME_N_HOURS_AGO: 'il y a {nHours}h',
	OW_TIME_IN_N_HOURS: 'dans {nHours}h',
	OW_TIME_N_DAYS_AGO: 'il y a {nDays} jour ~ il y a {nDays} jours',
	OW_TIME_IN_N_DAYS: 'dans {nDays} jour ~ dans {nDays} jours',
	OW_TIME_N_WEEKS_AGO: 'il y a {nWeeks} semaine ~ il y a {nWeeks} semaines ',
	OW_TIME_IN_N_WEEKS: 'dans {nWeeks} semaine ~ dans {nWeeks} semaines',
	OW_TIME_N_MONTHS_AGO: 'déjà {nMonths} mois',
	OW_TIME_IN_N_MONTHS: 'dans {nMonths} mois',
	OW_TIME_N_YEARS_AGO: 'déjà {nYears} an ~ déjà {nYears} ans',
	OW_TIME_IN_N_YEARS: 'dans {nYears} an ~ dans {nYears} ans',
} as OI18nDefinition;
