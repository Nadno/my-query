import $ from 'mini-q';

export const stepperStyle = $.style('stepper', {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  gap: '.5rem',
  parts: {
    item: {
      flex: 1,
      padding: '.6rem .75rem',
      borderRadius: 10,
      background: 'rgba(255,255,255,.04)',
      border: '1px solid var(--line)',
      fontSize: '.85rem',
      textAlign: 'center',
      opacity: 0.6,
      flags: {
        active: {
          opacity: 1,
          borderColor: 'rgba(102,126,234,.6)',
          background: 'rgba(102,126,234,.15)',
        },
        done: { opacity: 0.9 },
      },
    },
  },
});

export function Stepper(p: { step: () => number; labels: string[] }) {
  return $.ol(
    { class: stepperStyle },
    ...p.labels.map((label, i) =>
      $.li(
        { $class: () => stepperStyle.item({ active: p.step() === i, done: p.step() > i }) },
        `${i + 1}. ${label}`,
      ),
    ),
  );
}
