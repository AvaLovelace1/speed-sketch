import os
import sys

from setuptools import setup

data_files = [('', [os.path.join('src', 'icon.png')])]
mainscript = os.path.join('src', 'main.py')

if sys.platform == 'darwin':
    options = {
        'optimize': 2,
        'iconfile': os.path.join('src', 'icon'),
        # 'arch': 'x86_64',
        # 'arch': 'arm64',
    }
    extra_options = dict(
        setup_requires=['py2app'],
        app=[mainscript],
        options={'py2app': options},
    )
elif sys.platform == 'win32':
    import py2exe

    extra_options = dict(
        setup_requires=['py2exe'],
        windows=[mainscript],
    )
else:
    extra_options = dict(
        scripts=[mainscript],
    )

setup(
    name='SpeedSketch',
    version='1.1.0',
    description='An app that allows you to create timed drawing sessions using photo references on your own computer.',
    author='Ava Pun',
    license='MIT',
    data_files=data_files,
    **extra_options,
)
