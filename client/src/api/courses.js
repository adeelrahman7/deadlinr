import api from './client';

export async function getCourses() {
  const res = await api.get('/courses');
  return res.data.courses;
}

export async function getCourse(id) {
  const res = await api.get(`/courses/${id}`);
  return res.data.course;
}

export async function createCourse(data) {
  const res = await api.post('/courses', data);
  return res.data.course;
}

export async function updateCourse(id, data) {
  const res = await api.put(`/courses/${id}`, data);
  return res.data.course;
}

export async function deleteCourse(id) {
  await api.delete(`/courses/${id}`);
}