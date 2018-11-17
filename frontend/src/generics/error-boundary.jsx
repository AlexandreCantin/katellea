import { Component } from 'react';
import { withScope, captureException } from '@sentry/browser';

class ErrorBoundary extends Component {

    componentDidCatch(error, errorInfo) {
        withScope(scope => {
            Object.keys(errorInfo).forEach(key => {
                scope.setExtra(key, errorInfo[key]);
            });
            captureException(error);
        });
    }

    render() {
        return this.props.children;
    }
}

export default ErrorBoundary;