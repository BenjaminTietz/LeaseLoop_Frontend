export function appendFormData(
  formData: FormData,
  data: any,
  parentKey: string = ''
) {
  Object.entries(data).forEach(([key, value]) => {
    const formKey = parentKey ? `${parentKey}[${key}]` : key;
    if (value instanceof Object && !(value instanceof File)) {
      appendFormData(formData, value, formKey);
    } else {
      formData.append(formKey, String(value ?? ''));
    }
  });
}
