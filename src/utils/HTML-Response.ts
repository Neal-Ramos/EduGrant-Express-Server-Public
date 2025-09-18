export const AccountCreationRes = (h1: string, p: string): string => {
  return `
        <!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Notice</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #d7d7d7, #f0f0f0);
      color: #222;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
      box-sizing: border-box;
    }
    .card {
      background: #fff;
      padding: 2rem;
      border-radius: 14px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      text-align: center;
      max-width: 420px;
      width: 100%;
      border-top: 6px solid #28a745;
    }
    h1 {
      font-size: 1.8rem;
      margin-bottom: 0.8rem;
      color: #111;
    }
    p {
      font-size: 1.1rem;
      color: #555;
      margin-bottom: 0;
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #28a745;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .card {
        padding: 1.5rem;
      }
      h1 {
        font-size: 1.5rem;
      }
      p {
        font-size: 1rem;
      }
      .icon {
        font-size: 2.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>${h1}</h1>
    <p>${p}</p>
  </div>
</body>
</html>

    `;
};
