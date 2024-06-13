class FormatErpProductError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FormatErpProductError';
  }
}
export default FormatErpProductError;
