import PropTypes from '../../prop_types';
import { FormActions } from '../../actions';
import { autobind } from '../../utils/decorators';
import $ from 'jquery';

export default {
  propTypes: {
    errorMessage: PropTypes.string,
    baseErrorParam: PropTypes.string,
    onError: PropTypes.func,
    mapping: PropTypes.bool
  },

  getDefaultProps () {
    return {
      errorMessage: 'Por favor, verifique o(s) erro(s) abaixo.',
      baseErrorParam: 'base',
      onError: function (xhr, status, error) {
        return true;
      },
      mapping: true
    };
  },

  getInitialState () {
    return {
      errors: {}
    };
  },

  renderFlashErrors () {
    if ($.isEmptyObject(this.state.errors)) {
      return '';
    }

    return <Flash type="error" message={this.flashErrorMessage()} dismissed={false} />;
  },

  clearErrors () {
    this.setState({ errors: {} });
  },

  handleError (xhr, status, error) {
    this.setState({ isLoading: false });

    FormActions.error(this.props.id, xhr, status, error);
    if (this.props.onError(xhr, status, error)) {
      if (xhr.status === 422) {
        this.handleValidationError(xhr);
      }
    }
  },

  handleValidationError (xhr) {
    this.setState({ errors: this.getMappingErrors(xhr.responseText) });
  },

  getMappingErrors (error) {
    var errors = JSON.parse(error);
    if (this.props.mapping) {
      var mappingErrors = {};

      for (var property in errors) {
        var key = property.split('.').pop();
        mappingErrors[key] = errors[property]
      }

      return mappingErrors;
    } else {
      return errors;
    }
  },

  flashErrorMessage () {
    return (
      <div>
        {this.props.errorMessage}
        {this.baseErrorsList()}
      </div>
    );
  },

  baseErrorsList () {
    var baseErrors = this.state.errors[this.props.baseErrorParam];
    var baseErrorsListComponents = [];
    if (!baseErrors) {
      return '';
    }

    for (var i = 0; i < baseErrors.length; i++) {
      var baseError = baseErrors[i];
      baseErrorsListComponents.push(<li key={baseError}>{baseError}</li>);
    }

    return (
      <ul>
        {baseErrorsListComponents}
      </ul>
    );
  }
}