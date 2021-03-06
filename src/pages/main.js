const BasePage = require('./base.js');
const BorderedCell = require('../components/bordered_cell.js');
const dateFmt = require('../util/date.js');
const dateUtil = require('../util/date.js');
const IncidentPage = require('./incident.js');
const IncidentsService = require('../services/incidents.js');
const strFmt = require('../util/string_formatter.js');

class MainPage extends BasePage {
	constructor(navigationView) {
		super(navigationView);
		this.incidentsService = new IncidentsService();
		this.date = dateUtil.getTodayString();
	}

	factory() {
		let page = new tabris.Page({
			title: 'Seattle Fire',
		});

		/** @type {Incident[]} */
		this.incidents = [];

		this.view = new tabris.CollectionView({
			left: 0, top: 0, right: 0, bottom: 0,
			cellHeight: 68,
			refreshEnabled: true,
			createCell: () => {
				let cell = new BorderedCell();

				new tabris.TextView({
					top: 2, right: 6,
					id: 'time',
					font: 'black 16px',
				}).appendTo(cell);
				let type = new tabris.TextView({
					top: 2, left: 6, right: 6,
					id: 'type',
					font: 'bold 16px',
				}).appendTo(cell);
				let address = new tabris.TextView({
					top: [type, 1], left: 6, right: 6,
					id: 'address',
					font: '14px',
				}).appendTo(cell);
				new tabris.TextView({
					top: [address, 1], left: 6, right: 6,
					id: 'units',
					font: '12px',
				}).appendTo(cell);

				return cell;
			},
			updateCell: (cell, index) => {
				let incident = this.incidents[index];
				dateFmt.formatTime(incident.date).then((time) => {
					cell.children('#time')[0].set({
						text: time,
						textColor: incident.active ? 'green' : 'initial',
					});
				});
				cell.children('#type')[0].text = strFmt.incident_type(incident.type);
				cell.children('#address')[0].text = incident.address;
				cell.children('#units')[0].text = incident.units.join(', ');
			},
		}).on('refresh', () => {
			this._loadIncidents(this.date);
		}).on('select', ({index}) => {
			let incident = this.incidents[index];
			let pg = new IncidentPage(this.navigationView).factory(incident.incident, incident.date, incident.type,
				incident.address, incident.level, incident.units);
			pg.appendTo(this.navigationView);
		}).appendTo(page);

		this._loadIncidents(this.date);


		return page;
	}

	/**
	 * @param {string} date
	 * @return void
	 * @private
	 */
	_loadIncidents(date) {
		this.view.refreshIndicator = true;
		this.view.refreshMessage = 'loading...';
		this.incidents = this.incidentsService.getIncidentsUsingRegex(date).then(items => {
			this.incidents = items;
			if(this.view.itemCount < this.incidents.length) {
				this.view.insert(0, this.incidents.length - this.view.itemCount);
			} else if(this.view.itemCount > this.incidents.length) {
				this.view.remove(0, this.view.itemCount - this.incidents.length);
			}
			this.view.refresh();
		}).catch(err => {
			new tabris.AlertDialog({
				message: err,
				buttons: {
					ok: 'OK',
				},
			}).open();
		}).then(() => {
			this.view.refreshIndicator = false;
			this.view.refreshMessage = '';
			this.view.reveal(0);
		});
	}
}

module.exports = MainPage;
