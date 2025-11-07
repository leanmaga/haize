const FormInputOptions = ({ id, name, inputError, register, options }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {name} <span className="text-red-500">*</span>
      </label>
      <select
        id={id}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          inputError ? 'border-red-500' : 'border-gray-300'
        }`}
        {...register(id)}
      >
        <option value="">Selecciona una categoría</option>

        {options.map((product, index) => (
          <option
            className="text-sm text-black"
            key={index}
            value={product.value}
          >
            {product.name}
          </option>
        ))}
      </select>
      {inputError && <p className="mt-1 text-sm text-red-600">{inputError}</p>}
    </div>
  );
};

export default FormInputOptions;
