import { computed, signal, type Signal } from '@preact/signals-core';

export type Fields<T extends Record<string, unknown>> = {
  [K in keyof T]: Signal<T[K]>;
};

export interface FormApi<T extends Record<string, unknown>> {
  fields: Fields<T>;
  values: Signal<T>;
  errors: Signal<Record<string, string>>;
  touched: Signal<Record<string, boolean>>;
  isValid: Signal<boolean>;
  validate: () => boolean;
  submit: (fn: (values: T) => void | Promise<void>) => (e?: Event) => Promise<void>;
  touch: (name: string) => void;
  reset: (next?: Partial<T>) => void;
}

export function useForm<T extends Record<string, unknown>>(
  initial: T,
  validateFn: (values: T) => Record<string, string>,
): FormApi<T> {
  const fields = {} as Fields<T>;
  for (const key of Object.keys(initial) as (keyof T)[]) {
    fields[key] = signal(initial[key]) as Signal<T[typeof key]>;
  }

  const values = computed(() => {
    const out = {} as T;
    for (const key of Object.keys(fields) as (keyof T)[]) {
      out[key] = fields[key].value;
    }
    return out;
  });

  const errors = signal<Record<string, string>>({});
  const touched = signal<Record<string, boolean>>({});
  const isValid = computed(() => Object.keys(validateFn(values.value)).length === 0);

  function validate() {
    errors.value = validateFn(values.value);
    return Object.keys(errors.value).length === 0;
  }

  function touch(name: string) {
    touched.value = { ...touched.value, [name]: true };
  }

  function submit(fn: (values: T) => void | Promise<void>) {
    return async (e?: Event) => {
      e?.preventDefault();
      const all: Record<string, boolean> = {};
      for (const k of Object.keys(fields)) all[k] = true;
      touched.value = { ...touched.value, ...all };
      if (!validate()) return;
      await fn(values.value);
    };
  }

  function reset(next?: Partial<T>) {
    for (const key of Object.keys(fields) as (keyof T)[]) {
      const override = next?.[key];
      fields[key].value = (override !== undefined ? override : initial[key]) as T[typeof key];
    }
    errors.value = {};
    touched.value = {};
  }

  return { fields, values, errors, touched, isValid, validate, submit, touch, reset };
}

export function useField<T extends Record<string, unknown>, K extends keyof T>(
  form: FormApi<T>,
  name: K,
) {
  return {
    value: form.fields[name],
    error: () => form.errors.value[String(name)] ?? '',
    touched: () => !!form.touched.value[String(name)],
    touch: () => form.touch(String(name)),
  };
}
