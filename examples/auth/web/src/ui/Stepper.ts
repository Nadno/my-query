import $ from 'mini-q';
import sStepper from './Stepper.style';

export function Stepper(p: { step: () => number; labels: string[] }) {
  return $.ol(
    { class: sStepper },
    ...p.labels.map((label, i) =>
      $.li(
        { $class: () => sStepper.item({ active: p.step() === i, done: p.step() > i }) },
        `${i + 1}. ${label}`,
      ),
    ),
  );
}
