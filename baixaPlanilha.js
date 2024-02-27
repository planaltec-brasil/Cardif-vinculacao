const Imap = require("imap");

class EmailReader {
  constructor() {
    this.imapConfig = {
      user: "planaltecassurant@outlook.com",
      password: "Planaltec2675",
      host: "outlook.office365.com",
      port: 993,
      tls: true,
    };
    this.imap = new Imap(this.imapConfig);
  }

  readLastEmail() {
    return new Promise((resolve, reject) => {
      this.imap.once("ready", () => {
        this.imap.openBox("INBOX", true, (err, box) => {
          if (err) return reject(err);

          this.imap.search(["ALL"], (err, results) => {
            if (err) return reject(err);

            results.sort((a, b) => b - a);

            if (results.length === 0) {
              return resolve(null); // Nenhum e-mail encontrado
            }

            const lastEmailUid = results[0];
            const f = this.imap.fetch([lastEmailUid], { bodies: "" });

            f.on("message", (msg, seqno) => {
              let emailContent = "";

              msg.on("body", (stream, info) => {
                stream.on("data", (chunk) => {
                  emailContent += chunk.toString("utf8");
                });

                stream.on("end", () => {
                  const emailLines = emailContent.split("\n");
                  const slicedArray = emailLines.slice(203, 204);

                  // Obtém o código de 6 dígitos usando regex
                  const codigoMatch = slicedArray[0].match(/\b\d{6}\b/);

                  // Verifica se houve correspondência e extrai o código
                  let codigo = codigoMatch ? codigoMatch[0] : null;
                  codigo = codigo.trim();

                  resolve(codigo); // Resolve a promessa com o código extraído
                });
              });
            });

            f.once("error", (err) => {
              reject(err);
            });

            f.once("end", () => {
              this.imap.end();
            });
          });
        });
      });

      this.imap.connect();
    });
  }
}

// Modificando a chamada da função para obter o código
const emailReader = new EmailReader();

emailReader
  .readLastEmail()
  .then((codigo) => {
    console.log("Código do último e-mail:", codigo);
    // Agora você pode usar o valor de 'codigo' em sua outra aplicação.
  })
  .catch((error) => {
    console.error("Erro ao ler o último e-mail:", error);
  });
