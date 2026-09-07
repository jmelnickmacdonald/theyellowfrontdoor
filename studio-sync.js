(function (global) {

  const STUDIO_URL =
    "https://tyfd-dashboard.vercel.app/api/intake/formspree";

  function formDataToObject(formData) {
    const result = {};

    formData.forEach(function (value, key) {

      if (key === "_gotcha") return;
      if (value instanceof File) return;

      if (Object.prototype.hasOwnProperty.call(result, key)) {

        if (!Array.isArray(result[key])) {
          result[key] = [result[key]];
        }

        result[key].push(value);

      } else {

        result[key] = value;

      }

    });

    return result;
  }

  async function sync(formId, formData, extra) {

    const submission = Object.assign(
      {},
      formDataToObject(formData),
      extra || {},
      {
        _date: new Date().toISOString()
      }
    );

    try {

      await fetch(
        STUDIO_URL,
        {
          method: "POST",
          mode: "no-cors",

          headers: {
            "Content-Type": "text/plain;charset=UTF-8"
          },

          body: JSON.stringify({
            form: formId,
            submission: submission
          }),

          keepalive: true
        }
      );

      return true;

    } catch (error) {

      console.warn(
        "TYFD Studio sync failed:",
        error
      );

      return false;
    }
  }

  global.TYFDStudio = {
    sync: sync
  };

})(window);
