# Agent instructions

## Translations (i18n)

- One JSON file per domain in `src/i18n/locales/<locale>/<domain>.json`, loaded automatically (the file name is the root key: `labelPrinter.json` → `labelPrinter.*`).
- Always update every locale together (`fr-FR` and `en-GB`), with the same keys.
- Keep keys sorted alphabetically.
- No raw text in templates (`@intlify/vue-i18n/no-raw-text`): units and symbols (`mm`, `%`…) go through translations too.

### Form fields

Group the keys of a field under the field name:

```json
"size": {
  "label": "Hauteur du texte",
  "hint": "Entre {min} et {max} mm",
  "unit": "mm"
}
```

Only add the keys the field uses (`label`, `hint`, `unit`, `placeholder`…).

### Errors

Errors identified by a code go under `errors.byCode.<code>`, with a `title` and, when there is something to suggest to the user, a `hint`:

```json
"errors": {
  "byCode": {
    "battery_too_low": {
      "title": "Batterie trop faible pour imprimer."
    },
    "connection_failed": {
      "title": "Connexion à l'imprimante impossible.",
      "hint": "Fermez l'application DYMO Connect sur votre téléphone puis réessayez."
    }
  }
}
```

### Validations

Generic validation messages (`required`, `minValue`, `maxValue`…) live in `validations.json` and are used with `withAppI18nMessage` from `@/i18n`.

### Numbers

Format numbers passed to translations with `formatNumber` from `@/helpers/numeric`, not `$n`.
