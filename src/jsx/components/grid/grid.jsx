var Grid = React.createClass({
  mixins: [
    CssClassMixin,
    GridActionsMixin
  ],
  propTypes: {
    url: React.PropTypes.string,
    paginationConfigs: React.PropTypes.object,
    sortConfigs: React.PropTypes.object,
    sortData: React.PropTypes.object,
    filterForm: React.PropTypes.object,
    columns: React.PropTypes.object,
    data: React.PropTypes.object,
    dataRowsParam: React.PropTypes.string,
    countParam: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      paginationConfigs: {
        param: 'p',
        perPage: 20,
        window: 4
      },
      sortConfigs: {
        param: 's',
        valueFormat: '%{field} %{direction}'
      },
      sortData: {},
      filterForm: {
        inputs: {
          name: { label: 'Nome' }
        }
      },
      columns: {
        name: { label: 'Nome' }
      },
      dataRowsParam: 'data',
      countParam: 'count',
      themeClassKey: 'grid',
      data: {
        dataRows: [],
        count: 0
      }
    };
  },

  getInitialState: function() {
    return {
      dataRows: this.props.data.dataRows,
      selectedDataRowIds: [],
      count: this.props.data.count,
      page: 1,
      filterData: {},
      sortData: this.props.sortData,
      isLoading: false
    };
  },

  render: function() {
    return (
      <div className={this.gridClassName()}>
        {this.renderCollectionActionButtons()}
        {this.renderFilter()}

        {this.renderPagination()}
        {this.renderTable()}
        {this.renderPagination()}
      </div>
    );
  },

  gridClassName: function() {
    var className = this.className();
    if(this.state.isLoading) {
      className += ' loading';
    }

    return className;
  },

  renderFilter: function() {
    return (
      <GridFilter
        {...this.props.filterForm}
        url={this.props.url}
        isLoading={this.state.isLoading}
        onSubmit={this.onFilterSubmit}
      />
    );
  },

  renderTable: function() {
    return (
      <GridTable
        columns={this.props.columns}
        sortConfigs={this.props.sortConfigs}
        sortData={this.state.sortData}
        dataRows={this.state.dataRows}
        selectedDataRowIds={this.state.selectedDataRowIds}
        actionButtons={this.getMemberActionButtons()}
        onSort={this.onSort}
        onSelect={this.onSelectDataRow}
      />
    );
  },

  renderPagination: function() {
    var totalRowsCount = this.state.count;
    var pageRowsCount = this.state.dataRows.length;
    if(totalRowsCount <= pageRowsCount) {
      return null;
    }

    return (
      <GridPagination
        {...this.props.paginationConfigs}
        page={this.state.page}
        count={this.state.count}
        onPagination={this.onPagination}
      />
    );
  },

  onPagination: function(page) {
    this.setState({isLoading: true});
    this.state.page = page;
    this.loadData();
  },

  onFilterSubmit: function(event, postData) {
    event.preventDefault();

    this.setState({isLoading: true});
    this.state.selectedDataRowIds = [];
    this.state.filterData = postData;
    this.state.page = 1;
    this.loadData();
  },

  onSort: function(sortData) {
    this.setState({isLoading: true});
    this.state.sortData = sortData;
    this.state.page = 1;
    this.loadData();
  },

  onSelectDataRow: function(event, selectedDataRowIds) {
    event.preventDefault();

    this.setState({
      selectedDataRowIds: selectedDataRowIds
    });
  },

  loadData: function() {
    var postData = this.buildPostData();

    $.ajax({
      url: this.getActionUrl('index'),
      method: 'GET',
      dataType: 'json',
      data: postData,
      success: this.handleLoad,
      error: this.handleLoadError
    });
  },

  handleLoad: function(data) {
    this.setState({
      isLoading: false,
      dataRows: data[this.props.dataRowsParam],
      count: data[this.props.countParam]
    });
  },

  handleLoadError: function(xhr, status, error) {
    this.setState({isLoading: false});
    console.log('Grid Load error:' + error);
  },

  buildPostData: function() {
    var postData = $.extend({}, this.state.filterData);
    postData[this.props.paginationConfigs.param] = this.state.page;
    if(!$.isEmptyObject(this.state.sortData)) {
      $.extend(postData, this.buildSortPostData());
    }

    return postData;
  },

  buildSortPostData: function() {
    var sortParam = this.props.sortConfigs.param;
    var sortPostData = {};
    sortPostData[sortParam] = this.parseSortPostDataValue();

    return sortPostData;
  },

  parseSortPostDataValue: function() {
    var sortValueFormat = this.props.sortConfigs.valueFormat;
    var field = this.state.sortData.field;
    var direction = this.state.sortData.direction;

    return sortValueFormat.replace(/%\{field}/, field).replace(/%\{direction}/, direction);
  }

});
