# Cómo contribuir a Límite G

## Autores
- **Humanos** (Jhonatan J. Martínez Brooks y quien colabore): hacen commit con su propia identidad de git. Sus entradas del CHANGELOG terminan con "— firmado: <nombre>".
- **Hark** (agente de IA): en este repo usa la identidad local `Hark <hark@hark.ai>` (`git config user.name/user.email` locales, nunca globales) y firma todo lo que escribe.

## Mensajes de commit
- Trabajo de un módulo del [PLAN.md](PLAN.md): prefijo `Mx:` → `M3: sprites pixel art de Nova y Dr. Caos`.
- Infraestructura, documentación o arreglos fuera de un módulo: prefijo descriptivo (`QA:`, `Docs:`, `Fix:`, `Firma:`).
- En español, en presente, una línea de resumen (≤72 caracteres).

## Trailers obligatorios en commits de Hark
```
Signed-off-by: Hark <hark@hark.ai>
Co-authored-by: Hark <hark@hark.ai>
```
`scripts/hark-commit.sh "Mx: mensaje" [Added|Changed|Fixed|Removed] ["texto del CHANGELOG"]` hace todo: corre `scripts/qa.sh`, añade la línea firmada al CHANGELOG (sección `[Unreleased]`), `git add -A` y `git commit -s --trailer "Co-authored-by: …"`.

## CHANGELOG
Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Cada entrada termina con "— firmado: Hark" (o el nombre del autor humano).

## Cabecera de archivos nuevos
Todo archivo JS (o script) nuevo escrito por Hark empieza con:
```js
// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
```

## Antes de cada commit
`bash scripts/qa.sh` debe pasar. Nunca se sube un commit roto. Ver [docs/QA.md](docs/QA.md) para la revisión manual.
