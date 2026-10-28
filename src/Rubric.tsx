import { rubric } from "./data";
import { levelNames } from "./classReview";
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
  return (
    <>
      {rubric.map((row, i) => (
        <fieldset className="rubric-choice" key={row[0]} disabled={disabled}>
          <legend>{row[0]}</legend>
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
                <b>{label}</b>
                {level ? <small>{row[level]}</small> : null}
              </span>
            </label>
          ))}
        </fieldset>
      ))}
    </>
  );
}
