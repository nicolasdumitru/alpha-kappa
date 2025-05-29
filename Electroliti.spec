# -*- mode: python ; coding: utf-8 -*-


block_cipher = None


a = Analysis(
    ['server\\main.py'],
    pathex=[],
    binaries=[],
    datas=[('frontend', 'frontend'), ('server/electrolyte.py', 'server')],
    hiddenimports=['scipy.stats', 'scipy.sparse', 'scipy._lib', 'scipy._lib.array_api_compat', 'scipy._lib.array_api_compat.numpy.fft'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Electroliti',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['frontend\\images\\icon_logo.ico'],
)
