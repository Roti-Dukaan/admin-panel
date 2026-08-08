export const locationService = {
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      const requestPosition = (options: PositionOptions) =>
        new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, options);
        });

      requestPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      })
        .catch((error: GeolocationPositionError) => {
          if (error.code === 1) {
            throw error;
          }

          return requestPosition({
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000,
          });
        })
        .then(resolve)
        .catch(reject);
    });
  },
};
