import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ className = '', onClick, style, children, ...buttonProps }) => {
    return (
        <button className={`btn-btn ${className}`} style={style} onClick={onClick} {...buttonProps}>
            {children}
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
    style: PropTypes.object,
    children: PropTypes.node
};

export default Button;
