module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    
    // Tắt báo lỗi format code (dư dấu cách, ngoặc đơn/kép...)
    'prettier/prettier': 'off', 
    
    // Cho phép khai báo biến/import thư viện mà chưa cần dùng tới.
    '@typescript-eslint/no-unused-vars': 'off', 
    
    // Cho phép viết các function rỗng (ví dụ constructor rỗng).
    '@typescript-eslint/no-empty-function': 'off', 
    
    // Cho phép dùng console.log để debug.
    'no-console': 'off', 
    
    // Cho phép dùng comment // @ts-ignore để ép bỏ qua lỗi TypeScript khi cần.
    '@typescript-eslint/ban-ts-comment': 'off',
    
    // Cho phép khai báo các kiểu dữ liệu chung chung như Object, Function.
    '@typescript-eslint/ban-types': 'off',
  },
};