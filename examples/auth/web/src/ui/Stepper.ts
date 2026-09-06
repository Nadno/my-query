import $ from 'mini-q';

export const stepperStyle = $.parts('stepper', {
  root: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    gap: '.5rem',
  },
  item: {
    flex: 1,
    padding: '.6rem .75rem',
    borderRadius: 10,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid var(--line)',
    fontSize: '.85rem',
    textAlign: 'center',
    opacity: 0.6,
  },
});

$.style('stepper-item--active', {
  opacity: 1,
  borderColor: 'rgba(102,126,234,.6)',
  background: 'rgba(102,126,234,.15)',
});

$.style('stepper-item--done', { opacity: 0.9 });

export function Stepper(p: { step: () => number; labels: string[] }) {
  return $.ol(
    { class: stepperStyle.root },
    ...p.labels.map((label, i) =>
      $.li(
        {
          $class: () =>
            $.cx(
              stepperStyle.item,
              p.step() === i && 'stepper-item--active',
              p.step() > i && 'stepper-item--done',
            ),
        },
        `${i + 1}. ${label}`,
      ),
    ),
  );
}
