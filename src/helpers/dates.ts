// we have to properly format date to match the format of <vue-tailwind-datepicker />
export const DATE_FORMAT = 'YYYY-MM-DD' as const;

// week should start on monday
export const WEEK_DAYS_INDEXES = [...Array(7).keys()].map((index) => (index + 1) % 7);
