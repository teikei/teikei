import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { sendPlaceMessage } from "../duck";
import ContactForm from "./ContactForm";

const ContactTab = ({ onContactSubmit, initialValues }) => (
  <div id="contact">
    <div id="place-message-form-container">
      <ContactForm onSubmit={onContactSubmit} initialValues={initialValues} />
    </div>
  </div>
);

ContactTab.propTypes = {
  onContactSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape().isRequired,
};

const mapStateToProps = ({
  details: {
    feature: {
      properties: { id, type },
    },
  },
}) => ({
  initialValues: {
    id,
    type,
  },
});

const mapDispatchToProps = (dispatch) => ({
  onContactSubmit: (payload) => dispatch(sendPlaceMessage(payload)),
});

const ContactTabContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContactTab);

export default ContactTabContainer;
