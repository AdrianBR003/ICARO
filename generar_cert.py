import os
import datetime
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

def generar_certificado():
    # 1. Crear el directorio 'certs' si no existe en la carpeta actual
    certs_dir = os.path.join(os.getcwd(), "certs")
    if not os.path.exists(certs_dir):
        os.makedirs(certs_dir)
        print(f"Directorio creado: {certs_dir}")

    # 2. Generar clave privada RSA de 2048 bits
    key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    # 3. Configurar los detalles del certificado (Common Name: localhost)
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
    ])

    # 4. Crear el certificado autofirmado (válido por 365 días)
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.datetime.now(datetime.timezone.utc)
    ).not_valid_after(
        datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName([x509.DNSName(u"localhost")]),
        critical=False,
    ).sign(key, hashes.SHA256())

    # 5. Guardar la Clave Privada (certs/server.key)
    key_path = os.path.join(certs_dir, "server.key")
    with open(key_path, "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))

    # 6. Guardar el Certificado (certs/server.crt)
    cert_path = os.path.join(certs_dir, "server.crt")
    with open(cert_path, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    print("\n✅ ¡Certificados generados con éxito!")
    print(f" Archivo CRT: {cert_path}")
    print(f" Archivo KEY: {key_path}")

if __name__ == "__main__":
    generar_certificado()