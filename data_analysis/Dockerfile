FROM jupyter/scipy-notebook:latest

USER root

EXPOSE 8888
ENV NODE_ENV development

RUN conda install -c esri arcgis

COPY ./requirements.txt /code/

RUN pip install -r /code/requirements.txt

RUN echo "deb http://us.archive.ubuntu.com/ubuntu precise main universe" >> /etc/apt/sources.list && \
  apt-get update && \
  apt-get install -qqy libgeos-dev
