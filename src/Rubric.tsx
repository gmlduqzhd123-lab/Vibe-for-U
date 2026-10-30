import { rubric } from "./data";
import { levelNames } from "./classSummary";
import { useT } from "./i18n";
// 과정 평가표 네 항목의 단계를 고른다. 교사 평가와 학생 자기 평가에서 함께 쓴다.
export function RubricChoices({
  name,
  levels,
  onChange,
  disabled = false,
}: {
  name: string;
  levels: number[];
  onChange: (levels: number[]) => void;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <>
      {rubric.map((row, i) => (
        <fieldset className="rubric-choice" key={row[0]} disabled={disabled}>
          <legend>{t(row[0])}</legend>
          {levelNames.map((label, level) => (
            <label key={label}>
              <input
                type="radio"
                name={`${name}-${i}`}
                checked={levels[i] === level}
                onChange={() =>
                  onChange(levels.map((l, j) => (j === i ? level : l)))
                }
              />
              <span>
                <b>{t(label)}</b>
                {level ? <small>{t(row[level])}</small> : null}
              </span>
            </label>
          ))}
        </fieldset>
      ))}
    </>
  );
}
