import React from 'react'

const MultiForm = props => (
  <div>
    <h1>MULTI FORM</h1>
    <p>
      {props.children}
    </p>
  </div>
)

MultiForm.propTypes = {
  children: React.PropTypes.node.isRequired,
}

export default MultiForm
