import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FieldSelect, FieldTextInput, Form, PrimaryButton } from '../../components';
import { FormattedMessage } from 'react-intl';

import css from './ContactUsForm.module.css'


const ContactUsForm = props => {
    const { inProgress } = props;

    return (
        <FinalForm
            {...props}
            render={({ handleSubmit, pristine, invalid }) => {
                return (
                    <Form onSubmit={handleSubmit} className={css.root}>
                        <h2 className={css.title}>Contact us today</h2>

                        <div className={css.row}>
                            <FieldTextInput
                                id="firstName"
                                name="firstName"
                                type="text"
                                label="First Name"
                                placeholder="Enter first name"
                                required
                            />
                            <FieldTextInput
                                id="lastName"
                                name="lastName"
                                type="text"
                                label="Last Name"
                                placeholder="Enter last name"
                                required
                            />
                        </div>

                        <div className={css.row}>
                            <FieldTextInput
                                id="phone"
                                name="phone"
                                type="text"
                                label="Phone Number"
                                placeholder="Enter phone number"
                            />
                            <FieldTextInput
                                id="email"
                                name="email"
                                type="email"
                                label="Email Address"
                                placeholder="Enter email address"
                                required
                            />
                        </div>

                        <FieldTextInput
                            id="textarea"
                            name="message"
                            type="textarea"
                            label="Do you have a message?"
                            placeholder="Enter message"
                        />

                        <FieldTextInput
                            id="company"
                            name="company"
                            type="text"
                            label="Company Name"
                            placeholder="Enter company name"
                        />

                        <FieldSelect
                            name="hearAboutUs"
                            id="hearAboutUs"
                            label="How did you hear about us?"
                        >
                            <option value="">Select an option</option>
                            <option value="google">Google</option>
                            <option value="social">Social Media</option>
                            <option value="referral">Referral</option>
                            <option value="other">Other</option>
                        </FieldSelect>

                        <div className={css.submitWrapper}>
                            <PrimaryButton
                                type="submit"
                                inProgress={inProgress}
                                disabled={pristine || invalid}
                            >
                                <FormattedMessage id="ContactUsForm.submitButton" defaultMessage="Submit" />
                            </PrimaryButton>
                        </div>
                    </Form>
                );
            }}
        />
    );
};

export default ContactUsForm;
