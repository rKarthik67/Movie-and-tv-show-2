import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = (props) => {
    return (
        <button className={`btn-btn ${props.className}`} onClick={props.onClick ? () => props.onClick() : null}>
            {props.children}
        </button>
    );
};

export const OutlineButton = (props) => {
    return (
        <Button className={`btn-outline-btn ${props.className}`} onClick={props.onClick ? () => props.onClick() : null}>
            {props.children}
        </Button>
    );
};

Button.propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.node
};

export default Button;
