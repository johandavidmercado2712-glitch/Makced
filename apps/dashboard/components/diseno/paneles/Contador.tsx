export function Contador({ actual, max }: { actual: number; max: number }) {
  return (
    <span
      className={actual >= max ? "de-contador de-contador-full" : "de-contador"}
      aria-hidden="true"
    >
      {actual}/{max}
    </span>
  );
}
