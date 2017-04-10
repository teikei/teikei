import React, { PropTypes } from 'react'

const CheckboxGroup = ({ meta: { touched, error, warning }, input, groupLabel, options }) => (
  <div>
    <label htmlFor={groupLabel}>{groupLabel}</label>
    <ul id={groupLabel} className="form-checkbox-group">
      {options.map(({ name, label }, index) => (
        <li key={`checkbox_${name}`}>
          <label key={`label_${name}`} htmlFor={`${name}[${index}]`}>
            <input
              type="checkbox"
              name={`${name}[${index}]`}
              id={`${name}[${index}]`}
              value={name}
              checked={input.value.indexOf(name) !== -1}
              onChange={(event) => {
                const newValue = [...input.value];
                if (event.target.checked) {
                  newValue.push(name);
                } else {
                  newValue.splice(newValue.indexOf(name), 1);
                }
                return input.onChange(newValue);
              }}
            />
            {label}
          </label>
        </li>
      ))}
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </ul>
  </div>
)

CheckboxGroup.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  groupLabel: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.arrayOf(PropTypes.string),
    warning: PropTypes.string,
  }).isRequired,
}

export default CheckboxGroup
