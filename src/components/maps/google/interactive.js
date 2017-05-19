/* global esmaps */

class GoogleInteractiveMap extends esmaps.Map {
	constructor(options, lat, lon) {
		super(options);
		this.on('ready', () => {
			this.addMarker(new esmaps.Marker({
				position: [lat, lon],
			}));
			this.moveToPosition([lat, lon], 500, {
				padding: 16,
				animate: false,
			});
		});
		return this;
	}
}

module.exports = GoogleInteractiveMap;
