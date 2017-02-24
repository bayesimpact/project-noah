FROM jupyter/scipy-notebook:latest

EXPOSE 8888
ENV NODE_ENV development

RUN conda install -c esri arcgis

COPY ./requirements.txt /code/

RUN pip install -r /code/requirements.txt
