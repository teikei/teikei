import React from 'react'

const CheckboxGroup = ({ meta: { touched, error, warning }, input, groupLabel, options }) => (
  <div>
    <strong>{groupLabel}</strong>
    <div>
      {options.map(({ name, label }, index) => (
        <label key={`label_${name}`} htmlFor={`${name}[${index}]`}>
          <input
            type="checkbox"
            key={`checkbox_${name}`}
            name={`${name}[${index}]`}
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
      ))}
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  </div>
)

CheckboxGroup.propTypes = {
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
  }).isRequired,
  options: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  groupLabel: React.PropTypes.string.isRequired,
  meta: React.PropTypes.shape({
    touched: React.PropTypes.bool.isRequired,
    error: React.PropTypes.arrayOf(React.PropTypes.string),
    warning: React.PropTypes.string,
  }).isRequired,
}

export default CheckboxGroup
